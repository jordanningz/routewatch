import { getAllStats } from './metrics';
import { getCircuitState } from './circuitBreaker';
import { scanAllRoutesForAnomalies } from './anomalyDetection';
import { computePercentileStats } from './percentiles';
import { getRoutesByTag } from './tags';
import { DashboardSnapshot, DashboardRouteEntry } from './types';

export function buildDashboardSnapshot(): DashboardSnapshot {
  const allStats = getAllStats();
  const anomalies = scanAllRoutesForAnomalies();
  const anomalyRoutes = new Set(anomalies.map((a) => a.route));

  const routes: DashboardRouteEntry[] = Object.entries(allStats).map(
    ([route, stats]) => {
      const percentiles = computePercentileStats(stats.durations ?? []);
      const circuitState = getCircuitState(route);
      const isAnomaly = anomalyRoutes.has(route);

      return {
        route,
        requestCount: stats.count,
        avgDuration: stats.avgDuration,
        maxDuration: stats.maxDuration,
        minDuration: stats.minDuration,
        p50: percentiles.p50,
        p95: percentiles.p95,
        p99: percentiles.p99,
        circuitState,
        isAnomaly,
        errorRate: stats.errorRate ?? 0,
      };
    }
  );

  return {
    generatedAt: new Date().toISOString(),
    totalRoutes: routes.length,
    anomalyCount: anomalies.length,
    routes,
  };
}

export function getDashboardSummary(): Record<string, unknown> {
  const snapshot = buildDashboardSnapshot();
  const openCircuits = snapshot.routes.filter(
    (r) => r.circuitState === 'open'
  ).length;
  const slowRoutes = snapshot.routes.filter((r) => r.p95 > 1000).length;

  return {
    generatedAt: snapshot.generatedAt,
    totalRoutes: snapshot.totalRoutes,
    anomalyCount: snapshot.anomalyCount,
    openCircuits,
    slowRoutes,
  };
}
