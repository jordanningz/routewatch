import { getAllStats, clearMetrics, recordMetric } from './metrics';
import {
  getCircuitStatusForRoute,
  getAllCircuitStatuses,
  getTrippedCircuits,
} from './routeCircuitStatus';
import {
  configureCircuitBreaker,
  resetCircuitBreaker,
  recordFailure,
} from './circuitBreaker';

beforeEach(() => {
  clearMetrics();
  resetCircuitBreaker();
  configureCircuitBreaker({ failureThreshold: 3, recoveryTimeMs: 5000 });
});

function seedRoute(route: string, count = 5, avg = 100) {
  for (let i = 0; i < count; i++) {
    recordMetric(route, avg);
  }
}

describe('getCircuitStatusForRoute', () => {
  it('returns closed state for a healthy route', () => {
    seedRoute('/api/ok');
    const status = getCircuitStatusForRoute('/api/ok');
    expect(status.route).toBe('/api/ok');
    expect(status.state).toBe('closed');
    expect(status.tripped).toBe(false);
  });

  it('returns open state after failures exceed threshold', () => {
    seedRoute('/api/bad');
    recordFailure('/api/bad');
    recordFailure('/api/bad');
    recordFailure('/api/bad');
    const status = getCircuitStatusForRoute('/api/bad');
    expect(status.state).toBe('open');
    expect(status.tripped).toBe(true);
  });

  it('includes the configured threshold', () => {
    seedRoute('/api/x');
    const status = getCircuitStatusForRoute('/api/x');
    expect(status.threshold).toBe(3);
  });
});

describe('getAllCircuitStatuses', () => {
  it('returns a snapshot with counts', () => {
    seedRoute('/a');
    seedRoute('/b');
    recordFailure('/b');
    recordFailure('/b');
    recordFailure('/b');
    const snapshot = getAllCircuitStatuses();
    expect(snapshot.total).toBe(2);
    expect(snapshot.open).toBe(1);
    expect(snapshot.closed).toBe(1);
    expect(snapshot.timestamp).toBeTruthy();
  });
});

describe('getTrippedCircuits', () => {
  it('returns only tripped (open) circuits', () => {
    seedRoute('/ok');
    seedRoute('/fail');
    recordFailure('/fail');
    recordFailure('/fail');
    recordFailure('/fail');
    const tripped = getTrippedCircuits();
    expect(tripped).toHaveLength(1);
    expect(tripped[0].route).toBe('/fail');
  });

  it('returns empty array when no circuits are tripped', () => {
    seedRoute('/fine');
    expect(getTrippedCircuits()).toHaveLength(0);
  });
});
