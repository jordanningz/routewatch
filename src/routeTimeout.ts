/**
 * routeTimeout.ts
 * Stores and retrieves per-route timeout configuration.
 * A "timeout" defines the maximum allowed duration (ms) for a route before
 * it is considered timed-out, along with an optional action label.
 */

export interface TimeoutConfig {
  limitMs: number;
  action?: "log" | "alert" | "abort";
  description?: string;
}

interface TimeoutEntry extends TimeoutConfig {
  route: string;
  createdAt: string;
}

const timeouts = new Map<string, TimeoutEntry>();

export function setTimeout(
  route: string,
  config: TimeoutConfig
): TimeoutEntry {
  const entry: TimeoutEntry = {
    route,
    limitMs: config.limitMs,
    action: config.action ?? "log",
    description: config.description,
    createdAt: new Date().toISOString(),
  };
  timeouts.set(route, entry);
  return entry;
}

export function getTimeout(route: string): TimeoutEntry | undefined {
  return timeouts.get(route);
}

export function removeTimeout(route: string): boolean {
  return timeouts.delete(route);
}

export function getAllTimeouts(): TimeoutEntry[] {
  return Array.from(timeouts.values());
}

export function hasTimeout(route: string): boolean {
  return timeouts.has(route);
}

export function resetTimeouts(): void {
  timeouts.clear();
}

/**
 * Returns whether the given duration exceeds the configured timeout for a route.
 * Returns false if no timeout is configured.
 */
export function isTimedOut(route: string, durationMs: number): boolean {
  const entry = timeouts.get(route);
  if (!entry) return false;
  return durationMs > entry.limitMs;
}
