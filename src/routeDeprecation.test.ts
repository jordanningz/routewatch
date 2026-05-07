import {
  deprecateRoute,
  removeDeprecation,
  getDeprecation,
  getAllDeprecations,
  isDeprecated,
  isSunset,
  resetDeprecations,
  buildDeprecationHeader,
} from './routeDeprecation';

beforeEach(() => {
  resetDeprecations();
});

describe('deprecateRoute / getDeprecation', () => {
  it('stores a deprecation entry', () => {
    deprecateRoute('/api/v1/users', 'Use v2 instead', { replacement: '/api/v2/users' });
    const entry = getDeprecation('/api/v1/users');
    expect(entry).toBeDefined();
    expect(entry?.message).toBe('Use v2 instead');
    expect(entry?.replacement).toBe('/api/v2/users');
  });

  it('returns undefined for unknown route', () => {
    expect(getDeprecation('/unknown')).toBeUndefined();
  });
});

describe('isDeprecated', () => {
  it('returns true for deprecated route', () => {
    deprecateRoute('/old', 'Old route');
    expect(isDeprecated('/old')).toBe(true);
  });

  it('returns false for non-deprecated route', () => {
    expect(isDeprecated('/new')).toBe(false);
  });
});

describe('isSunset', () => {
  it('returns true when sunset date has passed', () => {
    deprecateRoute('/gone', 'Gone', { sunset: '2000-01-01T00:00:00.000Z' });
    expect(isSunset('/gone')).toBe(true);
  });

  it('returns false when sunset date is in the future', () => {
    deprecateRoute('/soon', 'Soon', { sunset: '2099-01-01T00:00:00.000Z' });
    expect(isSunset('/soon')).toBe(false);
  });

  it('returns false when no sunset date set', () => {
    deprecateRoute('/nodateroute', 'No date');
    expect(isSunset('/nodateroute')).toBe(false);
  });
});

describe('removeDeprecation', () => {
  it('removes an existing deprecation', () => {
    deprecateRoute('/remove-me', 'test');
    expect(removeDeprecation('/remove-me')).toBe(true);
    expect(isDeprecated('/remove-me')).toBe(false);
  });

  it('returns false for non-existent entry', () => {
    expect(removeDeprecation('/nonexistent')).toBe(false);
  });
});

describe('getAllDeprecations', () => {
  it('returns all deprecation entries', () => {
    deprecateRoute('/a', 'A');
    deprecateRoute('/b', 'B');
    expect(getAllDeprecations()).toHaveLength(2);
  });
});

describe('buildDeprecationHeader', () => {
  it('builds a header string with all fields', () => {
    deprecateRoute('/x', 'Old', { sunset: '2099-06-01T00:00:00.000Z', replacement: '/y' });
    const entry = getDeprecation('/x')!;
    const header = buildDeprecationHeader(entry);
    expect(header).toContain('Deprecated: Old');
    expect(header).toContain('Sunset:');
    expect(header).toContain('Use: /y');
  });
});
