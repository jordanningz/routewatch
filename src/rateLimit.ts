import { RouteStats } from './types';
import { getRouteStats } from './metrics';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  routes?: string[];
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const requestWindows = new Map<string, WindowEntry>();

let rateLimitConfig: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 100,
};

export function configureRateLimit(config: Partial<RateLimitConfig>): void {
  rateLimitConfig = { ...rateLimitConfig, ...config };
}

export function getRateLimitConfig(): RateLimitConfig {
  return { ...rateLimitConfig };
}

export function isRateLimited(route: string): boolean {
  const { routes, windowMs, maxRequests } = rateLimitConfig;

  if (routes && routes.length > 0 && !routes.includes(route)) {
    return false;
  }

  const now = Date.now();
  const entry = requestWindows.get(route);

  if (!entry || now - entry.windowStart >= windowMs) {
    requestWindows.set(route, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > maxRequests;
}

export function getWindowStats(route: string): WindowEntry | undefined {
  return requestWindows.get(route);
}

export function resetRateLimitWindows(): void {
  requestWindows.clear();
}

export function getRateLimitSummary(): Record<string, WindowEntry> {
  const summary: Record<string, WindowEntry> = {};
  requestWindows.forEach((entry, route) => {
    summary[route] = { ...entry };
  });
  return summary;
}
