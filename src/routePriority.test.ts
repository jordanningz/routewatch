import {
  setRoutePriority,
  getRoutePriority,
  removeRoutePriority,
  getAllPriorities,
  getRoutesByPriority,
  comparePriority,
  getEffectivePriority,
  resetPriorities,
} from './routePriority';

beforeEach(() => {
  resetPriorities();
});

describe('setRoutePriority / getRoutePriority', () => {
  it('stores and retrieves a priority entry', () => {
    setRoutePriority('/api/payments', 'critical', 'revenue-critical path');
    const entry = getRoutePriority('/api/payments');
    expect(entry).toBeDefined();
    expect(entry?.priority).toBe('critical');
    expect(entry?.reason).toBe('revenue-critical path');
    expect(typeof entry?.setAt).toBe('number');
  });

  it('returns undefined for unknown route', () => {
    expect(getRoutePriority('/unknown')).toBeUndefined();
  });

  it('overwrites existing priority', () => {
    setRoutePriority('/api/search', 'low');
    setRoutePriority('/api/search', 'high', 'promoted');
    expect(getRoutePriority('/api/search')?.priority).toBe('high');
  });
});

describe('removeRoutePriority', () => {
  it('removes an existing entry', () => {
    setRoutePriority('/api/users', 'medium');
    expect(removeRoutePriority('/api/users')).toBe(true);
    expect(getRoutePriority('/api/users')).toBeUndefined();
  });

  it('returns false for non-existent entry', () => {
    expect(removeRoutePriority('/nope')).toBe(false);
  });
});

describe('getAllPriorities / getRoutesByPriority', () => {
  it('returns all entries', () => {
    setRoutePriority('/a', 'low');
    setRoutePriority('/b', 'critical');
    expect(getAllPriorities()).toHaveLength(2);
  });

  it('filters by priority level', () => {
    setRoutePriority('/a', 'low');
    setRoutePriority('/b', 'critical');
    setRoutePriority('/c', 'critical');
    const criticals = getRoutesByPriority('critical');
    expect(criticals).toHaveLength(2);
    expect(criticals.every((e) => e.priority === 'critical')).toBe(true);
  });
});

describe('comparePriority', () => {
  it('returns positive when first is higher', () => {
    expect(comparePriority('critical', 'low')).toBeGreaterThan(0);
  });

  it('returns negative when first is lower', () => {
    expect(comparePriority('low', 'high')).toBeLessThan(0);
  });

  it('returns zero for equal priorities', () => {
    expect(comparePriority('medium', 'medium')).toBe(0);
  });
});

describe('getEffectivePriority', () => {
  it('returns assigned priority', () => {
    setRoutePriority('/api/orders', 'high');
    expect(getEffectivePriority('/api/orders')).toBe('high');
  });

  it('defaults to medium for unregistered routes', () => {
    expect(getEffectivePriority('/unregistered')).toBe('medium');
  });
});
