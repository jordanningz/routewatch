import {
  configureRateLimit,
  getRateLimitConfig,
  isRateLimited,
  getWindowStats,
  resetRateLimitWindows,
  getRateLimitSummary,
} from './rateLimit';

beforeEach(() => {
  resetRateLimitWindows();
  configureRateLimit({ windowMs: 60_000, maxRequests: 3, routes: undefined });
});

describe('configureRateLimit', () => {
  it('should update rate limit config', () => {
    configureRateLimit({ maxRequests: 50, windowMs: 30_000 });
    const config = getRateLimitConfig();
    expect(config.maxRequests).toBe(50);
    expect(config.windowMs).toBe(30_000);
  });

  it('should partially update config', () => {
    configureRateLimit({ maxRequests: 10 });
    const config = getRateLimitConfig();
    expect(config.maxRequests).toBe(10);
    expect(config.windowMs).toBe(60_000);
  });
});

describe('isRateLimited', () => {
  it('should not limit requests under the threshold', () => {
    expect(isRateLimited('/api/test')).toBe(false);
    expect(isRateLimited('/api/test')).toBe(false);
    expect(isRateLimited('/api/test')).toBe(false);
  });

  it('should limit requests over the threshold', () => {
    isRateLimited('/api/test');
    isRateLimited('/api/test');
    isRateLimited('/api/test');
    expect(isRateLimited('/api/test')).toBe(true);
  });

  it('should track routes independently', () => {
    isRateLimited('/api/a');
    isRateLimited('/api/a');
    isRateLimited('/api/a');
    isRateLimited('/api/a');
    expect(isRateLimited('/api/b')).toBe(false);
  });

  it('should skip routes not in the configured list', () => {
    configureRateLimit({ routes: ['/api/limited'] });
    for (let i = 0; i < 10; i++) isRateLimited('/api/other');
    expect(isRateLimited('/api/other')).toBe(false);
  });
});

describe('getWindowStats', () => {
  it('should return undefined for unknown routes', () => {
    expect(getWindowStats('/unknown')).toBeUndefined();
  });

  it('should return count after requests', () => {
    isRateLimited('/api/stats');
    isRateLimited('/api/stats');
    const stats = getWindowStats('/api/stats');
    expect(stats?.count).toBe(2);
  });
});

describe('getRateLimitSummary', () => {
  it('should return all tracked routes', () => {
    isRateLimited('/api/one');
    isRateLimited('/api/two');
    const summary = getRateLimitSummary();
    expect(Object.keys(summary)).toContain('/api/one');
    expect(Object.keys(summary)).toContain('/api/two');
  });
});
