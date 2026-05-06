import {
  configureCircuitBreaker,
  getCircuitBreakerConfig,
  getCircuitState,
  recordFailure,
  recordSlowRequest,
  checkCircuit,
  resetCircuit,
  resetAllCircuits,
} from './circuitBreaker';

beforeEach(() => {
  resetAllCircuits();
  configureCircuitBreaker({ failureThreshold: 5, recoveryTimeMs: 30000, slowRequestThreshold: 3 });
});

describe('configureCircuitBreaker', () => {
  it('should update config with provided values', () => {
    configureCircuitBreaker({ failureThreshold: 3 });
    expect(getCircuitBreakerConfig().failureThreshold).toBe(3);
  });

  it('should retain defaults for unspecified fields', () => {
    configureCircuitBreaker({ failureThreshold: 2 });
    expect(getCircuitBreakerConfig().recoveryTimeMs).toBe(30000);
  });
});

describe('getCircuitState', () => {
  it('should return a closed circuit for a new route', () => {
    const state = getCircuitState('/api/users');
    expect(state.state).toBe('closed');
    expect(state.failureCount).toBe(0);
  });
});

describe('recordFailure', () => {
  it('should increment failure count', () => {
    recordFailure('/api/orders');
    expect(getCircuitState('/api/orders').failureCount).toBe(1);
  });

  it('should open circuit when failure threshold is reached', () => {
    configureCircuitBreaker({ failureThreshold: 3 });
    recordFailure('/api/orders');
    recordFailure('/api/orders');
    const result = recordFailure('/api/orders');
    expect(result).toBe('open');
    expect(getCircuitState('/api/orders').state).toBe('open');
  });
});

describe('recordSlowRequest', () => {
  it('should open circuit when slow request threshold is reached', () => {
    configureCircuitBreaker({ slowRequestThreshold: 2 });
    recordSlowRequest('/api/reports');
    const result = recordSlowRequest('/api/reports');
    expect(result).toBe('open');
  });
});

describe('checkCircuit', () => {
  it('should transition open circuit to half-open after recovery time', () => {
    configureCircuitBreaker({ failureThreshold: 1, recoveryTimeMs: 0 });
    recordFailure('/api/slow');
    expect(checkCircuit('/api/slow')).toBe('half-open');
  });

  it('should keep circuit open before recovery time elapses', () => {
    configureCircuitBreaker({ failureThreshold: 1, recoveryTimeMs: 60000 });
    recordFailure('/api/slow');
    expect(checkCircuit('/api/slow')).toBe('open');
  });
});

describe('resetCircuit', () => {
  it('should reset a specific route circuit to closed', () => {
    configureCircuitBreaker({ failureThreshold: 1 });
    recordFailure('/api/items');
    resetCircuit('/api/items');
    expect(getCircuitState('/api/items').state).toBe('closed');
    expect(getCircuitState('/api/items').failureCount).toBe(0);
  });
});
