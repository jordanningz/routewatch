/**
 * routeEnvironment.ts
 * Tag routes with environment metadata (e.g. prod, staging, dev)
 * and query routes by environment.
 */

export type Environment = 'production' | 'staging' | 'development' | 'test' | string;

export interface EnvironmentEntry {
  route: string;
  environment: Environment;
  setAt: Date;
  setBy?: string;
}

const environmentMap = new Map<string, EnvironmentEntry>();

export function setRouteEnvironment(
  route: string,
  environment: Environment,
  setBy?: string
): EnvironmentEntry {
  const entry: EnvironmentEntry = {
    route,
    environment,
    setAt: new Date(),
    setBy,
  };
  environmentMap.set(route, entry);
  return entry;
}

export function getRouteEnvironment(route: string): EnvironmentEntry | undefined {
  return environmentMap.get(route);
}

export function removeRouteEnvironment(route: string): boolean {
  return environmentMap.delete(route);
}

export function getAllEnvironments(): EnvironmentEntry[] {
  return Array.from(environmentMap.values());
}

export function getRoutesByEnvironment(environment: Environment): EnvironmentEntry[] {
  return Array.from(environmentMap.values()).filter(
    (entry) => entry.environment === environment
  );
}

export function isRouteInEnvironment(route: string, environment: Environment): boolean {
  const entry = environmentMap.get(route);
  return entry !== undefined && entry.environment === environment;
}

export function resetEnvironments(): void {
  environmentMap.clear();
}
