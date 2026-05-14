/**
 * routeDependencies.ts
 * Track upstream/downstream dependencies between routes.
 */

export interface RouteDependency {
  upstream: string[];
  downstream: string[];
}

const dependencyMap = new Map<string, RouteDependency>();

function ensureEntry(route: string): RouteDependency {
  if (!dependencyMap.has(route)) {
    dependencyMap.set(route, { upstream: [], downstream: [] });
  }
  return dependencyMap.get(route)!;
}

export function addDependency(route: string, dependsOn: string): void {
  const entry = ensureEntry(route);
  if (!entry.upstream.includes(dependsOn)) {
    entry.upstream.push(dependsOn);
  }
  const depEntry = ensureEntry(dependsOn);
  if (!depEntry.downstream.includes(route)) {
    depEntry.downstream.push(route);
  }
}

export function removeDependency(route: string, dependsOn: string): void {
  const entry = dependencyMap.get(route);
  if (entry) {
    entry.upstream = entry.upstream.filter((r) => r !== dependsOn);
  }
  const depEntry = dependencyMap.get(dependsOn);
  if (depEntry) {
    depEntry.downstream = depEntry.downstream.filter((r) => r !== route);
  }
}

export function getDependencies(route: string): RouteDependency {
  return dependencyMap.get(route) ?? { upstream: [], downstream: [] };
}

export function getAllDependencies(): Record<string, RouteDependency> {
  const result: Record<string, RouteDependency> = {};
  for (const [route, dep] of dependencyMap.entries()) {
    result[route] = { ...dep, upstream: [...dep.upstream], downstream: [...dep.downstream] };
  }
  return result;
}

export function getTransitiveUpstream(route: string, visited = new Set<string>()): string[] {
  if (visited.has(route)) return [];
  visited.add(route);
  const { upstream } = getDependencies(route);
  const all: string[] = [...upstream];
  for (const dep of upstream) {
    all.push(...getTransitiveUpstream(dep, visited));
  }
  return [...new Set(all)];
}

export function clearDependenciesForRoute(route: string): void {
  const entry = dependencyMap.get(route);
  if (entry) {
    for (const dep of entry.upstream) {
      const depEntry = dependencyMap.get(dep);
      if (depEntry) {
        depEntry.downstream = depEntry.downstream.filter((r) => r !== route);
      }
    }
    for (const downstream of entry.downstream) {
      const downEntry = dependencyMap.get(downstream);
      if (downEntry) {
        downEntry.upstream = downEntry.upstream.filter((r) => r !== route);
      }
    }
  }
  dependencyMap.delete(route);
}

export function resetDependencies(): void {
  dependencyMap.clear();
}
