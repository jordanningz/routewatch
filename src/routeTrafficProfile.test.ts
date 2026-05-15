import {
  recordTrafficHit,
  getTrafficProfile,
  getAllTrafficProfiles,
  getRoutesByTier,
  getHourlyBuckets,
  resetTrafficProfiles,
} from './routeTrafficProfile';

beforeEach(() => {
  resetTrafficProfiles();
});

describe('recordTrafficHit', () => {
  it('creates a profile on first hit', () => {
    recordTrafficHit('/api/users');
    const profile = getTrafficProfile('/api/users');
    expect(profile).toBeDefined();
    expect(profile!.totalRequests).toBe(1);
    expect(profile!.route).toBe('/api/users');
  });

  it('increments totalRequests on subsequent hits', () => {
    recordTrafficHit('/api/users');
    recordTrafficHit('/api/users');
    recordTrafficHit('/api/users');
    expect(getTrafficProfile('/api/users')!.totalRequests).toBe(3);
  });

  it('assigns tier based on request count', () => {
    recordTrafficHit('/api/low');
    expect(getTrafficProfile('/api/low')!.tier).toBe('low');

    for (let i = 0; i < 999; i++) recordTrafficHit('/api/medium');
    expect(getTrafficProfile('/api/medium')!.tier).toBe('medium');
  });

  it('updates lastUpdated on each hit', () => {
    const before = Date.now();
    recordTrafficHit('/api/ts');
    const profile = getTrafficProfile('/api/ts')!;
    expect(profile.lastUpdated).toBeGreaterThanOrEqual(before);
  });
});

describe('getHourlyBuckets', () => {
  it('returns 24-slot array after hits', () => {
    recordTrafficHit('/api/buckets');
    const buckets = getHourlyBuckets('/api/buckets');
    expect(buckets).toHaveLength(24);
    expect(buckets!.reduce((a, b) => a + b, 0)).toBe(1);
  });

  it('returns undefined for unknown route', () => {
    expect(getHourlyBuckets('/api/unknown')).toBeUndefined();
  });
});

describe('getAllTrafficProfiles', () => {
  it('returns all tracked routes', () => {
    recordTrafficHit('/a');
    recordTrafficHit('/b');
    const all = getAllTrafficProfiles();
    expect(all).toHaveLength(2);
  });
});

describe('getRoutesByTier', () => {
  it('filters routes by tier', () => {
    recordTrafficHit('/api/low');
    for (let i = 0; i < 100; i++) recordTrafficHit('/api/medium');
    const low = getRoutesByTier('low');
    const medium = getRoutesByTier('medium');
    expect(low.map((p) => p.route)).toContain('/api/low');
    expect(medium.map((p) => p.route)).toContain('/api/medium');
  });
});

describe('resetTrafficProfiles', () => {
  it('clears all profiles and buckets', () => {
    recordTrafficHit('/api/reset');
    resetTrafficProfiles();
    expect(getAllTrafficProfiles()).toHaveLength(0);
    expect(getHourlyBuckets('/api/reset')).toBeUndefined();
  });
});
