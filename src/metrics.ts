import { RouteMetrics, RouteStats } from './types';

const metricsStore = new Map<string, RouteMetrics[]>();

export function recordMetric(route: string, method: string, durationMs: number, statusCode: number): void {
  const key = `${method.toUpperCase()} ${route}`;
  const entry: RouteMetrics = {
    route,
    method: method.toUpperCase(),
    durationMs,
    statusCode,
    timestamp: Date.now(),
  };

  if (!metricsStore.has(key)) {
    metricsStore.set(key, []);
  }

  metricsStore.get(key)!.push(entry);
}

export function getRouteStats(route: string, method: string): RouteStats | null {
  const key = `${method.toUpperCase()} ${route}`;
  const entries = metricsStore.get(key);

  if (!entries || entries.length === 0) return null;

  const durations = entries.map((e) => e.durationMs);
  const total = durations.reduce((sum, d) => sum + d, 0);

  return {
    route,
    method: method.toUpperCase(),
    count: entries.length,
    avgDurationMs: total / entries.length,
    minDurationMs: Math.min(...durations),
    maxDurationMs: Math.max(...durations),
    lastCalledAt: Math.max(...entries.map((e) => e.timestamp)),
  };
}

export function getAllStats(): RouteStats[] {
  const stats: RouteStats[] = [];

  for (const [key] of metricsStore) {
    const [method, route] = key.split(' ');
    const s = getRouteStats(route, method);
    if (s) stats.push(s);
  }

  return stats;
}

export function clearMetrics(): void {
  metricsStore.clear();
}
