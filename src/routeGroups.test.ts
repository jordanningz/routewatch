import {
  configureRouteGroups,
  getRouteGroups,
  resetRouteGroups,
  matchRouteToGroup,
  computeGroupStats,
} from './routeGroups';

beforeEach(() => {
  resetRouteGroups();
});

describe('configureRouteGroups / getRouteGroups', () => {
  it('stores configured groups', () => {
    configureRouteGroups([{ name: 'api', pattern: '/api' }]);
    const groups = getRouteGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('api');
  });

  it('returns empty array before configuration', () => {
    expect(getRouteGroups()).toEqual([]);
  });
});

describe('matchRouteToGroup', () => {
  beforeEach(() => {
    configureRouteGroups([
      { name: 'api', pattern: '/api' },
      { name: 'health', pattern: /^\/health/ },
    ]);
  });

  it('matches a string prefix', () => {
    expect(matchRouteToGroup('/api/users')).toBe('api');
  });

  it('matches a regex pattern', () => {
    expect(matchRouteToGroup('/health/check')).toBe('health');
  });

  it('returns null when no group matches', () => {
    expect(matchRouteToGroup('/metrics')).toBeNull();
  });

  it('returns first matching group', () => {
    configureRouteGroups([
      { name: 'first', pattern: '/api' },
      { name: 'second', pattern: '/api/users' },
    ]);
    expect(matchRouteToGroup('/api/users')).toBe('first');
  });
});

describe('computeGroupStats', () => {
  beforeEach(() => {
    configureRouteGroups([
      { name: 'api', pattern: '/api' },
      { name: 'admin', pattern: '/admin' },
    ]);
  });

  it('aggregates stats for matched routes', () => {
    const allStats = {
      '/api/users': { count: 10, totalDuration: 500, errors: 1 },
      '/api/posts': { count: 5, totalDuration: 250, errors: 0 },
      '/other':     { count: 3, totalDuration: 90,  errors: 0 },
    };
    const result = computeGroupStats(allStats);
    const api = result.find(g => g.name === 'api')!;
    expect(api.totalRequests).toBe(15);
    expect(api.totalErrors).toBe(1);
    expect(api.avgDurationMs).toBeCloseTo(50);
    expect(api.routes).toContain('/api/users');
  });

  it('returns zero stats for groups with no matching routes', () => {
    const result = computeGroupStats({});
    const admin = result.find(g => g.name === 'admin')!;
    expect(admin.totalRequests).toBe(0);
    expect(admin.avgDurationMs).toBe(0);
  });
});
