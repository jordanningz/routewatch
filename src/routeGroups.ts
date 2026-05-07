/**
 * routeGroups.ts
 * Group routes by prefix or pattern for aggregate stats and alerting.
 */

export interface RouteGroupConfig {
  name: string;
  pattern: RegExp | string;
}

export interface RouteGroupStats {
  name: string;
  routes: string[];
  totalRequests: number;
  totalErrors: number;
  avgDurationMs: number;
}

let groups: RouteGroupConfig[] = [];

export function configureRouteGroups(configs: RouteGroupConfig[]): void {
  groups = [...configs];
}

export function getRouteGroups(): RouteGroupConfig[] {
  return [...groups];
}

export function resetRouteGroups(): void {
  groups = [];
}

export function matchRouteToGroup(route: string): string | null {
  for (const group of groups) {
    if (typeof group.pattern === 'string') {
      if (route.startsWith(group.pattern)) return group.name;
    } else {
      if (group.pattern.test(route)) return group.name;
    }
  }
  return null;
}

export function computeGroupStats(
  allStats: Record<string, { count: number; totalDuration: number; errors: number }>
): RouteGroupStats[] {
  const groupMap: Record<string, { routes: string[]; totalRequests: number; totalErrors: number; totalDuration: number }> = {};

  for (const group of groups) {
    groupMap[group.name] = { routes: [], totalRequests: 0, totalErrors: 0, totalDuration: 0 };
  }

  for (const [route, stats] of Object.entries(allStats)) {
    const groupName = matchRouteToGroup(route);
    if (groupName && groupMap[groupName]) {
      const g = groupMap[groupName];
      g.routes.push(route);
      g.totalRequests += stats.count;
      g.totalErrors += stats.errors;
      g.totalDuration += stats.totalDuration;
    }
  }

  return Object.entries(groupMap).map(([name, g]) => ({
    name,
    routes: g.routes,
    totalRequests: g.totalRequests,
    totalErrors: g.totalErrors,
    avgDurationMs: g.totalRequests > 0 ? g.totalDuration / g.totalRequests : 0,
  }));
}
