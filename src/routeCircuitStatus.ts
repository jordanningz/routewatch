import { getCircuitState, getCircuitBreakerConfig } from './circuitBreaker';
import { getAllStats } from './metrics';

export type CircuitStatusEntry = {
  route: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  threshold: number;
  tripped: boolean;
};

export type CircuitStatusSnapshot = {
  timestamp: string;
  total: number;
  open: number;
  halfOpen: number;
  closed: number;
  routes: CircuitStatusEntry[];
};

export function getCircuitStatusForRoute(route: string): CircuitStatusEntry {
  const state = getCircuitState(route);
  const config = getCircuitBreakerConfig();
  const stats = getAllStats();
  const routeStats = stats[route];
  const failures = routeStats?.errorCount ?? 0;

  return {
    route,
    state,
    failures,
    threshold: config.failureThreshold,
    tripped: state === 'open',
  };
}

export function getAllCircuitStatuses(): CircuitStatusSnapshot {
  const stats = getAllStats();
  const routes = Object.keys(stats);

  const entries: CircuitStatusEntry[] = routes.map((route) =>
    getCircuitStatusForRoute(route)
  );

  const open = entries.filter((e) => e.state === 'open').length;
  const halfOpen = entries.filter((e) => e.state === 'half-open').length;
  const closed = entries.filter((e) => e.state === 'closed').length;

  return {
    timestamp: new Date().toISOString(),
    total: entries.length,
    open,
    halfOpen,
    closed,
    routes: entries,
  };
}

export function getTrippedCircuits(): CircuitStatusEntry[] {
  const snapshot = getAllCircuitStatuses();
  return snapshot.routes.filter((e) => e.tripped);
}
