import {
  setCostEstimate,
  getCostEstimate,
  removeCostEstimate,
  getAllCostEstimates,
  getRoutesByCostLabel,
  computeTotalCostScore,
  resetCostEstimates,
} from './routeCostEstimator';

beforeEach(() => resetCostEstimates());

describe('setCostEstimate', () => {
  it('stores an estimate and derives the correct label', () => {
    const est = setCostEstimate('GET /users', 2, 2, 2);
    expect(est.label).toBe('low');
    expect(est.route).toBe('GET /users');
  });

  it('derives medium label for mid-range weights', () => {
    const est = setCostEstimate('POST /orders', 4, 5, 5);
    expect(est.label).toBe('medium');
  });

  it('derives high label', () => {
    const est = setCostEstimate('GET /reports', 7, 7, 7);
    expect(est.label).toBe('high');
  });

  it('derives critical label', () => {
    const est = setCostEstimate('POST /export', 9, 9, 9);
    expect(est.label).toBe('critical');
  });

  it('throws RangeError for out-of-bounds weights', () => {
    expect(() => setCostEstimate('GET /bad', 0, 5, 5)).toThrow(RangeError);
    expect(() => setCostEstimate('GET /bad', 5, 11, 5)).toThrow(RangeError);
  });

  it('stores optional notes', () => {
    const est = setCostEstimate('GET /heavy', 8, 7, 9, 'DB-heavy endpoint');
    expect(est.notes).toBe('DB-heavy endpoint');
  });
});

describe('getCostEstimate', () => {
  it('returns undefined for unknown route', () => {
    expect(getCostEstimate('GET /unknown')).toBeUndefined();
  });

  it('returns the stored estimate', () => {
    setCostEstimate('GET /ping', 1, 1, 1);
    expect(getCostEstimate('GET /ping')).toBeDefined();
  });
});

describe('removeCostEstimate', () => {
  it('removes an existing estimate', () => {
    setCostEstimate('DELETE /item', 3, 3, 3);
    expect(removeCostEstimate('DELETE /item')).toBe(true);
    expect(getCostEstimate('DELETE /item')).toBeUndefined();
  });

  it('returns false for non-existent route', () => {
    expect(removeCostEstimate('GET /ghost')).toBe(false);
  });
});

describe('getAllCostEstimates', () => {
  it('returns all stored estimates', () => {
    setCostEstimate('GET /a', 1, 1, 1);
    setCostEstimate('GET /b', 5, 5, 5);
    expect(getAllCostEstimates()).toHaveLength(2);
  });
});

describe('getRoutesByCostLabel', () => {
  it('filters by label correctly', () => {
    setCostEstimate('GET /cheap', 1, 1, 1);
    setCostEstimate('GET /pricey', 9, 9, 9);
    expect(getRoutesByCostLabel('low')).toHaveLength(1);
    expect(getRoutesByCostLabel('critical')).toHaveLength(1);
  });
});

describe('computeTotalCostScore', () => {
  it('sums all weights', () => {
    setCostEstimate('GET /sum', 3, 4, 5);
    expect(computeTotalCostScore('GET /sum')).toBe(12);
  });

  it('returns undefined for unknown route', () => {
    expect(computeTotalCostScore('GET /nope')).toBeUndefined();
  });
});
