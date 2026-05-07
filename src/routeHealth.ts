import { getRouteStats } from './metrics';
import { getCircuitState } from './circuitBreaker';
import { isDeprecated } from './routeDeprecation';
import { isBlacklisted } from './routeBlacklist';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface RouteHealthReport {
  route: string;
  status: HealthStatus;
  reasons: string[];
  checkedAt: number;
}

export interface RouteHealthConfig {
  errorRateThreshold: number;   // 0–1, e.g. 0.1 = 10%
  slowRateThreshold: number;    // 0–1, fraction of requests that are slow
  minRequestsForEval: number;   // ignore routes with fewer requests
}

let config: RouteHealthConfig = {
  errorRateThreshold: 0.1,
  slowRateThreshold: 0.25,
  minRequestsForEval: 5,
};

export function configureRouteHealth(options: Partial<RouteHealthConfig>): void {
  config = { ...config, ...options };
}

export function getRouteHealthConfig(): RouteHealthConfig {
  return { ...config };
}

export function resetRouteHealthConfig(): void {
  config = {
    errorRateThreshold: 0.1,
    slowRateThreshold: 0.25,
    minRequestsForEval: 5,
  };
}

export function assessRouteHealth(route: string): RouteHealthReport {
  const reasons: string[] = [];
  const stats = getRouteStats(route);
  const circuitState = getCircuitState(route);
  const checkedAt = Date.now();

  if (isBlacklisted(route)) {
    return { route, status: 'unhealthy', reasons: ['Route is blacklisted'], checkedAt };
  }

  if (isDeprecated(route)) {
    reasons.push('Route is deprecated');
  }

  if (!stats || stats.count < config.minRequestsForEval) {
    return { route, status: 'unknown', reasons: ['Insufficient request data'], checkedAt };
  }

  if (circuitState === 'open') {
    reasons.push('Circuit breaker is open');
  } else if (circuitState === 'half-open') {
    reasons.push('Circuit breaker is half-open');
  }

  const errorRate = stats.errorCount / stats.count;
  if (errorRate >= config.errorRateThreshold) {
    reasons.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
  }

  const slowRate = stats.slowCount / stats.count;
  if (slowRate >= config.slowRateThreshold) {
    reasons.push(`High slow-request rate: ${(slowRate * 100).toFixed(1)}%`);
  }

  let status: HealthStatus = 'healthy';
  if (circuitState === 'open' || errorRate >= config.errorRateThreshold) {
    status = 'unhealthy';
  } else if (reasons.length > 0) {
    status = 'degraded';
  }

  return { route, status, reasons, checkedAt };
}

export function assessAllRoutes(): RouteHealthReport[] {
  const { getAllStats } = require('./metrics');
  const allStats = getAllStats() as Record<string, unknown>;
  return Object.keys(allStats).map(assessRouteHealth);
}
