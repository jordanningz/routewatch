import {
  aliasRoute,
  getAlias,
  removeAlias,
  getAllAliases,
  findPatternByAlias,
  resetAliases,
} from './routeAlias';

beforeEach(() => {
  resetAliases();
});

describe('aliasRoute / getAlias', () => {
  it('registers and retrieves an alias', () => {
    aliasRoute('/users/:id', 'Get User');
    expect(getAlias('/users/:id')).toBe('Get User');
  });

  it('returns the pattern itself when no alias is registered', () => {
    expect(getAlias('/unknown/route')).toBe('/unknown/route');
  });

  it('throws when pattern is empty', () => {
    expect(() => aliasRoute('', 'Some Alias')).toThrow();
  });

  it('throws when alias is empty', () => {
    expect(() => aliasRoute('/some/route', '')).toThrow();
  });

  it('overwrites an existing alias', () => {
    aliasRoute('/orders/:id', 'Fetch Order');
    aliasRoute('/orders/:id', 'Get Order Detail');
    expect(getAlias('/orders/:id')).toBe('Get Order Detail');
  });
});

describe('removeAlias', () => {
  it('removes a registered alias', () => {
    aliasRoute('/items/:id', 'Get Item');
    removeAlias('/items/:id');
    expect(getAlias('/items/:id')).toBe('/items/:id');
  });

  it('does not throw when removing a non-existent alias', () => {
    expect(() => removeAlias('/nonexistent')).not.toThrow();
  });
});

describe('getAllAliases', () => {
  it('returns all registered aliases', () => {
    aliasRoute('/a', 'Alpha');
    aliasRoute('/b', 'Beta');
    const all = getAllAliases();
    expect(all).toEqual({ '/a': 'Alpha', '/b': 'Beta' });
  });

  it('returns an empty object when no aliases are registered', () => {
    expect(getAllAliases()).toEqual({});
  });
});

describe('findPatternByAlias', () => {
  it('finds the pattern for a known alias', () => {
    aliasRoute('/products/:id', 'Get Product');
    expect(findPatternByAlias('Get Product')).toBe('/products/:id');
  });

  it('returns undefined for an unknown alias', () => {
    expect(findPatternByAlias('Nonexistent')).toBeUndefined();
  });
});
