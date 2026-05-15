/**
 * routeVersioning.ts
 * Track and manage API version information per route.
 */

export interface RouteVersionInfo {
  version: string;
  introducedAt?: string;
  sunsetAt?: string;
  notes?: string;
}

const versionRegistry = new Map<string, RouteVersionInfo>();

export function setRouteVersion(
  pattern: string,
  info: RouteVersionInfo
): void {
  if (!pattern || !info.version) {
    throw new Error("pattern and version are required");
  }
  versionRegistry.set(pattern, { ...info });
}

export function getRouteVersion(
  pattern: string
): RouteVersionInfo | undefined {
  return versionRegistry.get(pattern);
}

export function removeRouteVersion(pattern: string): boolean {
  return versionRegistry.delete(pattern);
}

export function getAllVersions(): Record<string, RouteVersionInfo> {
  const result: Record<string, RouteVersionInfo> = {};
  for (const [pattern, info] of versionRegistry.entries()) {
    result[pattern] = { ...info };
  }
  return result;
}

export function getRoutesByVersion(
  version: string
): string[] {
  const matches: string[] = [];
  for (const [pattern, info] of versionRegistry.entries()) {
    if (info.version === version) {
      matches.push(pattern);
    }
  }
  return matches;
}

export function getSunsetRoutes(asOf: string = new Date().toISOString()): string[] {
  const sunset: string[] = [];
  for (const [pattern, info] of versionRegistry.entries()) {
    if (info.sunsetAt && info.sunsetAt <= asOf) {
      sunset.push(pattern);
    }
  }
  return sunset;
}

export function resetVersions(): void {
  versionRegistry.clear();
}
