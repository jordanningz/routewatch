import {
  setLatencyBudget,
  getLatencyBudget,
  removeLatencyBudget,
  getAllLatencyBudgets,
  resetLatencyBudgets,
  evaluateBudget,
  evaluateAllBudgets,
} from './routeLatencyBudget';

beforeEach(() => {
  resetLatencyBudgets();
});

describe('setLatencyBudget / getLatencyBudget', () => {
  it('stores and retrieves a budget config', () => {
    setLatencyBudget('GET /api/users', { budgetMs: 200, warningThresholdPct: 0.8 });
    expect(getLatencyBudget('GET /api/users')).toEqual({ budgetMs: 200, warningThresholdPct: 0.8 });
  });

  it('returns undefined for unknown routes', () => {
    expect(getLatencyBudget('GET /unknown')).toBeUndefined();
  });

  it('throws for non-positive budgetMs', () => {
    expect(() => setLatencyBudget('GET /a', { budgetMs: 0, warningThresholdPct: 0.8 })).toThrow();
  });

  it('throws for out-of-range warningThresholdPct', () => {
    expect(() => setLatencyBudget('GET /a', { budgetMs: 100, warningThresholdPct: 1 })).toThrow();
    expect(() => setLatencyBudget('GET /a', { budgetMs: 100, warningThresholdPct: 0 })).toThrow();
  });
});

describe('removeLatencyBudget', () => {
  it('removes an existing budget and returns true', () => {
    setLatencyBudget('GET /api/items', { budgetMs: 150, warningThresholdPct: 0.75 });
    expect(removeLatencyBudget('GET /api/items')).toBe(true);
    expect(getLatencyBudget('GET /api/items')).toBeUndefined();
  });

  it('returns false when route not found', () => {
    expect(removeLatencyBudget('GET /nonexistent')).toBe(false);
  });
});

describe('getAllLatencyBudgets', () => {
  it('returns all configured budgets', () => {
    setLatencyBudget('GET /a', { budgetMs: 100, warningThresholdPct: 0.8 });
    setLatencyBudget('POST /b', { budgetMs: 300, warningThresholdPct: 0.9 });
    const all = getAllLatencyBudgets();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET /a'].budgetMs).toBe(100);
  });
});

describe('evaluateBudget', () => {
  beforeEach(() => {
    setLatencyBudget('GET /api/data', { budgetMs: 200, warningThresholdPct: 0.8 });
  });

  it('returns ok when p99 is well within budget', () => {
    const result = evaluateBudget('GET /api/data', 100);
    expect(result.status).toBe('ok');
    expect(result.consumedPct).toBeCloseTo(0.5);
  });

  it('returns warning when p99 is at warning threshold', () => {
    const result = evaluateBudget('GET /api/data', 170);
    expect(result.status).toBe('warning');
  });

  it('returns exceeded when p99 surpasses budget', () => {
    const result = evaluateBudget('GET /api/data', 250);
    expect(result.status).toBe('exceeded');
  });

  it('returns no-data when p99 is null', () => {
    const result = evaluateBudget('GET /api/data', null);
    expect(result.status).toBe('no-data');
  });

  it('returns no-data for unregistered route', () => {
    const result = evaluateBudget('DELETE /missing', 50);
    expect(result.status).toBe('no-data');
  });
});

describe('evaluateAllBudgets', () => {
  it('evaluates all registered routes using the stats provider', () => {
    setLatencyBudget('GET /fast', { budgetMs: 100, warningThresholdPct: 0.8 });
    setLatencyBudget('GET /slow', { budgetMs: 100, warningThresholdPct: 0.8 });
    const provider = (route: string) =>
      route === 'GET /fast' ? { p99: 50 } : { p99: 200 };
    const results = evaluateAllBudgets(provider);
    expect(results).toHaveLength(2);
    const fast = results.find((r) => r.route === 'GET /fast');
    const slow = results.find((r) => r.route === 'GET /slow');
    expect(fast?.status).toBe('ok');
    expect(slow?.status).toBe('exceeded');
  });
});
