import { buildDashboardSnapshot, getDashboardSummary } from './dashboard';
import { recordMetric, clearMetrics } from './metrics';
import { resetAnomalyDetectionConfig } from './anomalyDetection';
import { configureCircuitBreaker } from './circuitBreaker';

beforeEach(() => {
  clearMetrics();
  resetAnomalyDetectionConfig();
});

describe('buildDashboardSnapshot', () => {
  it('returns empty routes when no metrics recorded', () => {
    const snapshot = buildDashboardSnapshot();
    expect(snapshot.routes).toHaveLength(0);
    expect(snapshot.totalRoutes).toBe(0);
    expect(snapshot.anomalyCount).toBe(0);
    expect(snapshot.generatedAt).toBeDefined();
  });

  it('includes recorded routes with stats', () => {
    recordMetric('GET /api/users', 120, 200);
    recordMetric('GET /api/users', 200, 200);
    const snapshot = buildDashboardSnapshot();
    expect(snapshot.routes).toHaveLength(1);
    const route = snapshot.routes[0];
    expect(route.route).toBe('GET /api/users');
    expect(route.requestCount).toBe(2);
    expect(route.p50).toBeGreaterThan(0);
    expect(route.p95).toBeGreaterThan(0);
  });

  it('includes circuit state for routes', () => {
    configureCircuitBreaker({ failureThreshold: 3, slowThreshold: 1000, openDurationMs: 5000 });
    recordMetric('GET /api/slow', 500, 200);
    const snapshot = buildDashboardSnapshot();
    const route = snapshot.routes.find((r) => r.route === 'GET /api/slow');
    expect(route?.circuitState).toBeDefined();
  });

  it('marks anomaly routes correctly', () => {
    for (let i = 0; i < 20; i++) {
      recordMetric('GET /api/stable', 100, 200);
    }
    recordMetric('GET /api/stable', 9999, 200);
    const snapshot = buildDashboardSnapshot();
    const route = snapshot.routes.find((r) => r.route === 'GET /api/stable');
    expect(route?.isAnomaly).toBe(true);
  });
});

describe('getDashboardSummary', () => {
  it('returns summary fields', () => {
    recordMetric('GET /api/test', 300, 200);
    const summary = getDashboardSummary();
    expect(summary.totalRoutes).toBe(1);
    expect(summary.generatedAt).toBeDefined();
    expect(typeof summary.openCircuits).toBe('number');
    expect(typeof summary.slowRoutes).toBe('number');
  });
});
