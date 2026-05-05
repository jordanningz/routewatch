import { recordMetric, getRouteStats, getAllStats, clearMetrics } from './metrics';

describe('metrics', () => {
  beforeEach(() => {
    clearMetrics();
  });

  describe('recordMetric', () => {
    it('records a single metric entry', () => {
      recordMetric('/api/users', 'GET', 120, 200);
      const stats = getRouteStats('/api/users', 'GET');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(1);
    });

    it('accumulates multiple entries for the same route', () => {
      recordMetric('/api/users', 'GET', 100, 200);
      recordMetric('/api/users', 'GET', 200, 200);
      recordMetric('/api/users', 'GET', 300, 200);
      const stats = getRouteStats('/api/users', 'GET');
      expect(stats!.count).toBe(3);
    });

    it('treats different methods as separate entries', () => {
      recordMetric('/api/users', 'GET', 100, 200);
      recordMetric('/api/users', 'POST', 150, 201);
      expect(getRouteStats('/api/users', 'GET')!.count).toBe(1);
      expect(getRouteStats('/api/users', 'POST')!.count).toBe(1);
    });
  });

  describe('getRouteStats', () => {
    it('returns null for unknown route', () => {
      expect(getRouteStats('/unknown', 'GET')).toBeNull();
    });

    it('calculates correct avg, min, max durations', () => {
      recordMetric('/api/items', 'GET', 50, 200);
      recordMetric('/api/items', 'GET', 150, 200);
      const stats = getRouteStats('/api/items', 'GET')!;
      expect(stats.avgDurationMs).toBe(100);
      expect(stats.minDurationMs).toBe(50);
      expect(stats.maxDurationMs).toBe(150);
    });

    it('is case-insensitive for method', () => {
      recordMetric('/api/items', 'get', 80, 200);
      const stats = getRouteStats('/api/items', 'GET');
      expect(stats).not.toBeNull();
    });
  });

  describe('getAllStats', () => {
    it('returns empty array when no metrics recorded', () => {
      expect(getAllStats()).toEqual([]);
    });

    it('returns stats for all recorded routes', () => {
      recordMetric('/api/users', 'GET', 100, 200);
      recordMetric('/api/posts', 'POST', 200, 201);
      expect(getAllStats()).toHaveLength(2);
    });
  });
});
