import {
  setRouteEnvironment,
  getRouteEnvironment,
  removeRouteEnvironment,
  getAllEnvironments,
  getRoutesByEnvironment,
  isRouteInEnvironment,
  resetEnvironments,
} from './routeEnvironment';

beforeEach(() => {
  resetEnvironments();
});

describe('setRouteEnvironment', () => {
  it('stores an environment entry for a route', () => {
    const entry = setRouteEnvironment('/api/users', 'production', 'alice');
    expect(entry.route).toBe('/api/users');
    expect(entry.environment).toBe('production');
    expect(entry.setBy).toBe('alice');
    expect(entry.setAt).toBeInstanceOf(Date);
  });

  it('overwrites an existing entry', () => {
    setRouteEnvironment('/api/users', 'staging');
    setRouteEnvironment('/api/users', 'production');
    const entry = getRouteEnvironment('/api/users');
    expect(entry?.environment).toBe('production');
  });
});

describe('getRouteEnvironment', () => {
  it('returns undefined for unknown route', () => {
    expect(getRouteEnvironment('/unknown')).toBeUndefined();
  });

  it('returns the entry for a known route', () => {
    setRouteEnvironment('/api/health', 'development');
    expect(getRouteEnvironment('/api/health')?.environment).toBe('development');
  });
});

describe('removeRouteEnvironment', () => {
  it('removes an existing entry and returns true', () => {
    setRouteEnvironment('/api/orders', 'staging');
    expect(removeRouteEnvironment('/api/orders')).toBe(true);
    expect(getRouteEnvironment('/api/orders')).toBeUndefined();
  });

  it('returns false when route does not exist', () => {
    expect(removeRouteEnvironment('/nonexistent')).toBe(false);
  });
});

describe('getAllEnvironments', () => {
  it('returns all entries', () => {
    setRouteEnvironment('/a', 'production');
    setRouteEnvironment('/b', 'staging');
    expect(getAllEnvironments()).toHaveLength(2);
  });
});

describe('getRoutesByEnvironment', () => {
  it('filters routes by environment', () => {
    setRouteEnvironment('/api/users', 'production');
    setRouteEnvironment('/api/orders', 'staging');
    setRouteEnvironment('/api/health', 'production');
    const prod = getRoutesByEnvironment('production');
    expect(prod).toHaveLength(2);
    expect(prod.map((e) => e.route)).toContain('/api/users');
    expect(prod.map((e) => e.route)).toContain('/api/health');
  });
});

describe('isRouteInEnvironment', () => {
  it('returns true when route matches environment', () => {
    setRouteEnvironment('/api/users', 'production');
    expect(isRouteInEnvironment('/api/users', 'production')).toBe(true);
  });

  it('returns false when environment does not match', () => {
    setRouteEnvironment('/api/users', 'staging');
    expect(isRouteInEnvironment('/api/users', 'production')).toBe(false);
  });

  it('returns false for unknown route', () => {
    expect(isRouteInEnvironment('/unknown', 'production')).toBe(false);
  });
});
