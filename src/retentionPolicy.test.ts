import {
  configureRetentionPolicy,
  getRetentionPolicyConfig,
  touchRoute,
  runEviction,
  startRetentionSweep,
  stopRetentionSweep,
  resetRetentionPolicy,
} from './retentionPolicy';
import { recordMetric, getAllStats, clearMetrics } from './metrics';

beforeEach(() => {
  resetRetentionPolicy();
  // Clear all metrics by iterating existing routes
  Object.keys(getAllStats()).forEach((r) => clearMetrics(r));
});

afterEach(() => {
  stopRetentionSweep();
});

describe('configureRetentionPolicy', () => {
  it('returns default config initially', () => {
    const cfg = getRetentionPolicyConfig();
    expect(cfg.maxAgeMs).toBe(24 * 60 * 60 * 1000);
    expect(cfg.maxEntries).toBe(500);
    expect(cfg.sweepIntervalMs).toBe(60 * 1000);
  });

  it('merges partial config', () => {
    configureRetentionPolicy({ maxEntries: 100 });
    expect(getRetentionPolicyConfig().maxEntries).toBe(100);
    expect(getRetentionPolicyConfig().maxAgeMs).toBe(24 * 60 * 60 * 1000);
  });
});

describe('runEviction – age-based', () => {
  it('evicts routes older than maxAgeMs', () => {
    configureRetentionPolicy({ maxAgeMs: 1000 });
    recordMetric('GET /old', 200);
    // Simulate an old last-seen by touching with a past timestamp via low maxAge
    touchRoute('GET /old');

    // Fast-forward: set maxAgeMs to 0 so everything is stale
    configureRetentionPolicy({ maxAgeMs: 0 });
    const evicted = runEviction();
    expect(evicted).toContain('GET /old');
    expect(getAllStats()['GET /old']).toBeUndefined();
  });

  it('does not evict recently touched routes', () => {
    configureRetentionPolicy({ maxAgeMs: 60_000 });
    recordMetric('GET /fresh', 150);
    touchRoute('GET /fresh');
    const evicted = runEviction();
    expect(evicted).not.toContain('GET /fresh');
  });
});

describe('runEviction – maxEntries', () => {
  it('evicts oldest entries when over maxEntries', () => {
    configureRetentionPolicy({ maxAgeMs: 999_999, maxEntries: 2 });
    ['GET /a', 'GET /b', 'GET /c'].forEach((r, i) => {
      recordMetric(r, 100);
      // stagger timestamps
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000 + i * 100);
      touchRoute(r);
    });
    jest.spyOn(Date, 'now').mockRestore();
    const evicted = runEviction();
    const remaining = Object.keys(getAllStats());
    expect(remaining.length).toBeLessThanOrEqual(2);
    expect(evicted.length).toBeGreaterThanOrEqual(1);
  });
});

describe('sweep timer', () => {
  it('startRetentionSweep / stopRetentionSweep do not throw', () => {
    configureRetentionPolicy({ sweepIntervalMs: 100_000 });
    expect(() => startRetentionSweep()).not.toThrow();
    expect(() => startRetentionSweep()).not.toThrow(); // idempotent
    expect(() => stopRetentionSweep()).not.toThrow();
  });
});
