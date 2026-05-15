import {
  getTierForRate,
  recordRateHit,
  getRateProfile,
  getAllRateProfiles,
  getRoutesByRateTier,
  resetRateProfiles,
} from './routeRateProfile';

beforeEach(() => {
  resetRateProfiles();
});

describe('getTierForRate', () => {
  it('returns idle for 0 rpm', () => expect(getTierForRate(0)).toBe('idle'));
  it('returns low for < 10 rpm', () => expect(getTierForRate(5)).toBe('low'));
  it('returns medium for < 100 rpm', () => expect(getTierForRate(50)).toBe('medium'));
  it('returns high for < 500 rpm', () => expect(getTierForRate(200)).toBe('high'));
  it('returns critical for >= 500 rpm', () => expect(getTierForRate(500)).toBe('critical'));
});

describe('recordRateHit', () => {
  it('creates a profile on first hit', () => {
    const p = recordRateHit('/api/test');
    expect(p.route).toBe('/api/test');
    expect(p.totalRequests).toBe(1);
    expect(p.requestsInWindow).toBe(1);
  });

  it('increments totalRequests on subsequent hits', () => {
    recordRateHit('/api/test');
    recordRateHit('/api/test');
    const p = recordRateHit('/api/test');
    expect(p.totalRequests).toBe(3);
  });

  it('returns a copy, not a reference', () => {
    const p1 = recordRateHit('/api/test');
    p1.totalRequests = 999;
    const p2 = getRateProfile('/api/test');
    expect(p2?.totalRequests).toBe(1);
  });
});

describe('getRateProfile', () => {
  it('returns undefined for unknown route', () => {
    expect(getRateProfile('/unknown')).toBeUndefined();
  });

  it('returns profile after a hit', () => {
    recordRateHit('/api/users');
    const p = getRateProfile('/api/users');
    expect(p).toBeDefined();
    expect(p?.route).toBe('/api/users');
  });
});

describe('getAllRateProfiles', () => {
  it('returns empty array initially', () => {
    expect(getAllRateProfiles()).toHaveLength(0);
  });

  it('returns all tracked routes', () => {
    recordRateHit('/a');
    recordRateHit('/b');
    const all = getAllRateProfiles();
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.route)).toContain('/a');
    expect(all.map((p) => p.route)).toContain('/b');
  });
});

describe('getRoutesByRateTier', () => {
  it('returns routes matching the given tier', () => {
    recordRateHit('/api/slow');
    const idleRoutes = getRoutesByRateTier('idle');
    // freshly recorded routes may be idle or low depending on timing
    const lowRoutes = getRoutesByRateTier('low');
    expect(idleRoutes.length + lowRoutes.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty array when no routes match tier', () => {
    expect(getRoutesByRateTier('critical')).toHaveLength(0);
  });
});

describe('resetRateProfiles', () => {
  it('clears all profiles', () => {
    recordRateHit('/api/x');
    resetRateProfiles();
    expect(getAllRateProfiles()).toHaveLength(0);
  });
});
