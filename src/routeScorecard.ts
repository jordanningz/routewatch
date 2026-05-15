import { getRouteStats } from './metrics';
import { assessRouteHealth } from './routeHealth';
import { getLatencyBudget } from './routeLatencyBudget';
import { getSLA } from './routeSLA';
import { getDeprecation } from './routeDeprecation';

export interface RouteScorecard {
  route: string;
  score: number; // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    healthScore: number;
    latencyScore: number;
    slaScore: number;
    activityScore: number;
  };
  flags: string[];
}

function gradeFromScore(score: number): RouteScorecard['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export function scoreRoute(route: string): RouteScorecard {
  const flags: string[] = [];
  const stats = getRouteStats(route);
  const health = assessRouteHealth(route);
  const budget = getLatencyBudget(route);
  const sla = getSLA(route);
  const deprecated = getDeprecation(route);

  // Health score (0–40)
  const healthMap: Record<string, number> = { healthy: 40, degraded: 20, unhealthy: 0 };
  const healthScore = healthMap[health?.status ?? 'healthy'] ?? 40;
  if (health?.status === 'unhealthy') flags.push('unhealthy');
  if (health?.status === 'degraded') flags.push('degraded');

  // Latency score (0–30)
  let latencyScore = 30;
  if (stats && budget) {
    const ratio = stats.avgDuration / budget.budgetMs;
    if (ratio > 1.5) { latencyScore = 0; flags.push('latency_critical'); }
    else if (ratio > 1.0) { latencyScore = 10; flags.push('latency_over_budget'); }
    else if (ratio > 0.75) { latencyScore = 20; }
  }

  // SLA score (0–20)
  let slaScore = 20;
  if (stats && sla) {
    const errorRate = stats.totalRequests > 0 ? stats.errorCount / stats.totalRequests : 0;
    if (errorRate > 1 - sla.availability) { slaScore = 0; flags.push('sla_breach'); }
    else if (errorRate > (1 - sla.availability) * 0.75) { slaScore = 10; flags.push('sla_at_risk'); }
  }

  // Activity score (0–10)
  let activityScore = 10;
  if (!stats || stats.totalRequests === 0) { activityScore = 5; flags.push('no_traffic'); }
  if (deprecated) { activityScore = 0; flags.push('deprecated'); }

  const score = Math.min(100, healthScore + latencyScore + slaScore + activityScore);
  return { route, score, grade: gradeFromScore(score), breakdown: { healthScore, latencyScore, slaScore, activityScore }, flags };
}

export function scoreAllRoutes(): RouteScorecard[] {
  const { getAllStats } = require('./metrics');
  const allStats: Record<string, unknown> = getAllStats();
  return Object.keys(allStats).map(scoreRoute).sort((a, b) => a.score - b.score);
}
