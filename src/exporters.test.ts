import { exportStats, exportAsJson, exportAsCsv, exportAsPrometheus } from './exporters';
import { recordMetric, clearMetrics } from './metrics';

beforeEach(() => {
  clearMetrics();
  recordMetric('/api/users', 120);
  recordMetric('/api/users', 80);
  recordMetric('/api/posts', 200);
});

afterEach(() => {
  clearMetrics();
});

describe('exportAsJson', () => {
  it('returns valid JSON with all routes', () => {
    const result = exportAsJson({ format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed['/api/users']).toBeDefined();
    expect(parsed['/api/posts']).toBeDefined();
    expect(parsed['/api/users'].count).toBe(2);
  });

  it('respects includeRoutes filter', () => {
    const result = exportAsJson({ format: 'json', includeRoutes: ['/api/users'] });
    const parsed = JSON.parse(result);
    expect(parsed['/api/users']).toBeDefined();
    expect(parsed['/api/posts']).toBeUndefined();
  });

  it('respects excludeRoutes filter', () => {
    const result = exportAsJson({ format: 'json', excludeRoutes: ['/api/posts'] });
    const parsed = JSON.parse(result);
    expect(parsed['/api/users']).toBeDefined();
    expect(parsed['/api/posts']).toBeUndefined();
  });
});

describe('exportAsCsv', () => {
  it('returns CSV with header and rows', () => {
    const result = exportAsCsv({ format: 'csv' });
    const lines = result.split('\n');
    expect(lines[0]).toBe('route,count,totalMs,avgMs,minMs,maxMs');
    expect(lines.length).toBe(3);
  });

  it('calculates average correctly', () => {
    const result = exportAsCsv({ format: 'csv' });
    const usersRow = result.split('\n').find(l => l.startsWith('/api/users'))!;
    expect(usersRow).toContain('100.00');
  });
});

describe('exportAsPrometheus', () => {
  it('returns prometheus-style metrics', () => {
    const result = exportAsPrometheus({ format: 'prometheus' });
    expect(result).toContain('routewatch_requests_total{route="/api/users"} 2');
    expect(result).toContain('routewatch_duration_ms_max{route="/api/posts"} 200');
  });
});

describe('exportStats', () => {
  it('dispatches to correct formatter', () => {
    expect(() => exportStats({ format: 'json' })).not.toThrow();
    expect(() => exportStats({ format: 'csv' })).not.toThrow();
    expect(() => exportStats({ format: 'prometheus' })).not.toThrow();
  });

  it('throws on unsupported format', () => {
    expect(() => exportStats({ format: 'xml' as any })).toThrow('Unsupported export format');
  });
});
