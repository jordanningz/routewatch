import {
  setSLA,
  getSLA,
  removeSLA,
  getAllSLAs,
  resetSLAs,
  checkSLA,
  checkAllSLAs,
} from './routeSLA';
import { clearMetrics, recordMetric } from './metrics';

function seedRoute(route: string, durations: number[], errors = 0) {
  for (let i = 0; i < durations.length; i++) {
    recordMetric(route, durations[i], i < errors ? 500 : 200);
  }
}

beforeEach(() => {
  resetSLAs();
  clearMetrics();
});

describe('setSLA / getSLA', () => {
  it('stores and retrieves an SLA config', () => {
    setSLA('/api/users', { maxP95Ms: 200, maxErrorRate: 0.01, minAvailability: 0.99 });
    expect(getSLA('/api/users')).toEqual({ maxP95Ms: 200, maxErrorRate: 0.01, minAvailability: 0.99 });
  });

  it('returns undefined for unknown routes', () => {
    expect(getSLA('/unknown')).toBeUndefined();
  });
});

describe('removeSLA', () => {
  it('removes an existing SLA', () => {
    setSLA('/api/orders', { maxP95Ms: 300, maxErrorRate: 0.05, minAvailability: 0.95 });
    removeSLA('/api/orders');
    expect(getSLA('/api/orders')).toBeUndefined();
  });
});

describe('getAllSLAs', () => {
  it('returns all registered SLAs', () => {
    setSLA('/a', { maxP95Ms: 100, maxErrorRate: 0.01, minAvailability: 0.99 });
    setSLA('/b', { maxP95Ms: 200, maxErrorRate: 0.05, minAvailability: 0.95 });
    const all = getAllSLAs();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['/a'].maxP95Ms).toBe(100);
  });
});

describe('checkSLA', () => {
  it('returns null for routes without an SLA', () => {
    expect(checkSLA('/no-sla')).toBeNull();
  });

  it('passes when all metrics are within limits', () => {
    seedRoute('/api/fast', [50, 60, 55, 58, 52]);
    setSLA('/api/fast', { maxP95Ms: 200, maxErrorRate: 0.05, minAvailability: 0.95 });
    const status = checkSLA('/api/fast');
    expect(status?.passing).toBe(true);
    expect(status?.violations).toHaveLength(0);
  });

  it('reports a violation when error rate is exceeded', () => {
    seedRoute('/api/flaky', [100, 100, 100, 100, 100], 3);
    setSLA('/api/flaky', { maxP95Ms: 500, maxErrorRate: 0.1, minAvailability: 0.9 });
    const status = checkSLA('/api/flaky');
    expect(status?.passing).toBe(false);
    expect(status?.violations.some(v => v.includes('error rate'))).toBe(true);
  });
});

describe('checkAllSLAs', () => {
  it('returns statuses for all registered routes', () => {
    seedRoute('/api/a', [100]);
    seedRoute('/api/b', [100]);
    setSLA('/api/a', { maxP95Ms: 200, maxErrorRate: 0.05, minAvailability: 0.95 });
    setSLA('/api/b', { maxP95Ms: 50, maxErrorRate: 0.05, minAvailability: 0.95 });
    const results = checkAllSLAs();
    expect(results).toHaveLength(2);
  });
});
