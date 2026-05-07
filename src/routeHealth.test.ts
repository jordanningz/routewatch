import {
  configureRouteHealth,
  resetRouteHealthConfig,
  assessRouteHealth,
  getRouteHealthConfig,
} from './routeHealth';
import { recordMetric, clearMetrics } from './metrics';
import { resetRateLimitWindows } from './rateLimit';
import { blacklistRoute, resetBlacklist } from './routeBlacklist';

function seedRoute(
  route: string,
  count: number,
  errorCount: number,
  slowCount: number,
  avgDuration = 100
) {
  for (let i = 0; i < count; i++) {
    const isError = i < errorCount;
    const isSlow = i < slowCount;
    recordMetric(route, isError ? 500 : 200, isSlow ? 2000 : avgDuration, isSlow);
  }
}

beforeEach(() => {
  clearMetrics();
  resetBlacklist();
  resetRouteHealthConfig();
});

describe('configureRouteHealth', () => {
  it('updates config fields', () => {
    configureRouteHealth({ errorRateThreshold: 0.2 });
    expect(getRouteHealthConfig().errorRateThreshold).toBe(0.2);
  });

  it('preserves unspecified defaults', () => {
    configureRouteHealth({ minRequestsForEval: 10 });
    const cfg = getRouteHealthConfig();
    expect(cfg.slowRateThreshold).toBe(0.25);
    expect(cfg.minRequestsForEval).toBe(10);
  });
});

describe('assessRouteHealth', () => {
  it('returns unknown for routes with no data', () => {
    const report = assessRouteHealth('GET /unknown');
    expect(report.status).toBe('unknown');
  });

  it('returns unknown when below minRequestsForEval', () => {
    seedRoute('GET /few', 3, 0, 0);
    const report = assessRouteHealth('GET /few');
    expect(report.status).toBe('unknown');
  });

  it('returns healthy for a well-behaved route', () => {
    seedRoute('GET /ok', 20, 0, 0);
    const report = assessRouteHealth('GET /ok');
    expect(report.status).toBe('healthy');
    expect(report.reasons).toHaveLength(0);
  });

  it('returns unhealthy when error rate exceeds threshold', () => {
    seedRoute('GET /bad', 10, 5, 0);
    const report = assessRouteHealth('GET /bad');
    expect(report.status).toBe('unhealthy');
    expect(report.reasons.some(r => r.includes('error rate'))).toBe(true);
  });

  it('returns degraded when slow rate exceeds threshold', () => {
    seedRoute('GET /slow', 10, 0, 4);
    const report = assessRouteHealth('GET /slow');
    expect(report.status).toBe('degraded');
    expect(report.reasons.some(r => r.includes('slow-request'))).toBe(true);
  });

  it('returns unhealthy for blacklisted routes immediately', () => {
    blacklistRoute('GET /blocked');
    const report = assessRouteHealth('GET /blocked');
    expect(report.status).toBe('unhealthy');
    expect(report.reasons[0]).toContain('blacklisted');
  });

  it('includes checkedAt timestamp', () => {
    const before = Date.now();
    seedRoute('GET /ts', 10, 0, 0);
    const report = assessRouteHealth('GET /ts');
    expect(report.checkedAt).toBeGreaterThanOrEqual(before);
  });
});
