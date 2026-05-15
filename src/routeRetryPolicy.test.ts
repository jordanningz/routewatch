import {
  setRetryPolicy,
  getRetryPolicy,
  removeRetryPolicy,
  getAllRetryPolicies,
  hasRetryPolicy,
  shouldRetry,
  getBackoffDelay,
  resetRetryPolicies,
} from './routeRetryPolicy';

beforeEach(() => {
  resetRetryPolicies();
});

describe('setRetryPolicy / getRetryPolicy', () => {
  it('stores and retrieves a retry policy', () => {
    setRetryPolicy('GET /api/data', { maxRetries: 5 });
    const policy = getRetryPolicy('GET /api/data');
    expect(policy?.maxRetries).toBe(5);
    expect(policy?.backoffMs).toBe(100);
    expect(policy?.retryOn).toContain(503);
  });

  it('returns undefined for unknown route', () => {
    expect(getRetryPolicy('GET /unknown')).toBeUndefined();
  });
});

describe('removeRetryPolicy', () => {
  it('removes an existing policy', () => {
    setRetryPolicy('POST /submit', {});
    expect(removeRetryPolicy('POST /submit')).toBe(true);
    expect(hasRetryPolicy('POST /submit')).toBe(false);
  });

  it('returns false when route not found', () => {
    expect(removeRetryPolicy('GET /missing')).toBe(false);
  });
});

describe('getAllRetryPolicies', () => {
  it('returns all stored policies', () => {
    setRetryPolicy('GET /a', { maxRetries: 1 });
    setRetryPolicy('GET /b', { maxRetries: 2 });
    const all = getAllRetryPolicies();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET /a'].maxRetries).toBe(1);
  });
});

describe('shouldRetry', () => {
  it('returns true when status is in retryOn and attempts remain', () => {
    setRetryPolicy('GET /flaky', { maxRetries: 3, retryOn: [503] });
    expect(shouldRetry('GET /flaky', 503, 1)).toBe(true);
  });

  it('returns false when max retries reached', () => {
    setRetryPolicy('GET /flaky', { maxRetries: 2 });
    expect(shouldRetry('GET /flaky', 503, 2)).toBe(false);
  });

  it('returns false for status not in retryOn', () => {
    setRetryPolicy('GET /flaky', { retryOn: [503] });
    expect(shouldRetry('GET /flaky', 404, 0)).toBe(false);
  });

  it('returns false for unknown route', () => {
    expect(shouldRetry('GET /none', 503, 0)).toBe(false);
  });
});

describe('getBackoffDelay', () => {
  it('returns exponential backoff based on attempt count', () => {
    setRetryPolicy('GET /slow', { backoffMs: 100 });
    expect(getBackoffDelay('GET /slow', 0)).toBe(100);
    expect(getBackoffDelay('GET /slow', 1)).toBe(200);
    expect(getBackoffDelay('GET /slow', 2)).toBe(400);
  });

  it('returns 0 for unknown route', () => {
    expect(getBackoffDelay('GET /none', 1)).toBe(0);
  });
});
