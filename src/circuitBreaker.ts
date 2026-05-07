import { CircuitBreakerConfig, CircuitBreakerState, RouteCircuitState } from './types';

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeMs: 30000,
  slowRequestThreshold: 3,
};

let config: CircuitBreakerConfig = { ...DEFAULT_CONFIG };
const circuitStates = new Map<string, RouteCircuitState>();

export function configureCircuitBreaker(userConfig: Partial<CircuitBreakerConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

export function getCircuitBreakerConfig(): CircuitBreakerConfig {
  return { ...config };
}

export function getCircuitState(route: string): RouteCircuitState {
  if (!circuitStates.has(route)) {
    circuitStates.set(route, {
      state: 'closed',
      failureCount: 0,
      slowCount: 0,
      lastFailureTime: null,
      openedAt: null,
    });
  }
  return circuitStates.get(route)!;
}

export function recordFailure(route: string): CircuitBreakerState {
  const circuit = getCircuitState(route);
  circuit.failureCount += 1;
  circuit.lastFailureTime = Date.now();

  if (circuit.failureCount >= config.failureThreshold) {
    circuit.state = 'open';
    circuit.openedAt = Date.now();
  }

  return circuit.state;
}

export function recordSlowRequest(route: string): CircuitBreakerState {
  const circuit = getCircuitState(route);
  circuit.slowCount += 1;

  if (circuit.slowCount >= config.slowRequestThreshold) {
    circuit.state = 'open';
    circuit.openedAt = Date.now();
  }

  return circuit.state;
}

export function checkCircuit(route: string): CircuitBreakerState {
  const circuit = getCircuitState(route);

  if (circuit.state === 'open' && circuit.openedAt !== null) {
    const elapsed = Date.now() - circuit.openedAt;
    if (elapsed >= config.recoveryTimeMs) {
      circuit.state = 'half-open';
    }
  }

  return circuit.state;
}

export function resetCircuit(route: string): void {
  circuitStates.set(route, {
    state: 'closed',
    failureCount: 0,
    slowCount: 0,
    lastFailureTime: null,
    openedAt: null,
  });
}

export function resetAllCircuits(): void {
  circuitStates.clear();
}

/**
 * Returns a snapshot of all tracked circuit states, keyed by route.
 * Useful for monitoring dashboards and health-check endpoints.
 */
export function getAllCircuitStates(): Record<string, RouteCircuitState> {
  const snapshot: Record<string, RouteCircuitState> = {};
  for (const [route, state] of circuitStates.entries()) {
    snapshot[route] = { ...state };
  }
  return snapshot;
}
