import { scoreRoute, scoreAllRoutes } from './routeScorecard';
import { recordMetric, clearMetrics } from './metrics';
import { configureRouteHealth, resetRouteHealthConfig } from './routeHealth';
import { setLatencyBudget, resetLatencyBudgets } from './routeLatencyBudget';
import { setSLA, resetSLAs } from './routeSLA';
import { deprecateRoute, removeDeprecation } from './routeDeprecation';

function seedRoute(route: string, avg: number, errors = 0, total = 100) {
  for (let i = 0; i < total - errors; i++) recordMetric(route, avg, 200);
  for (let i = 0; i < errors; i++) recordMetric(route, avg, 500);
}

beforeEach(() => {
  clearMetrics();
  resetRouteHealthConfig();
  resetLatencyBudgets();
  resetSLAs();
  removeDeprecation('GET /test');
});

describe('scoreRoute', () => {
  it('returns a perfect score for a healthy route within budget', () => {
    seedRoute('GET /test', 100);
    setLatencyBudget('GET /test', { budgetMs: 500 });
    setSLA('GET /test', { availability: 0.99, maxLatencyMs: 500 });
    const card = scoreRoute('GET /test');
    expect(card.score).toBe(100);
    expect(card.grade).toBe('A');
    expect(card.flags).toHaveLength(0);
  });

  it('penalises a route over latency budget', () => {
    seedRoute('GET /test', 600);
    setLatencyBudget('GET /test', { budgetMs: 300 });
    const card = scoreRoute('GET /test');
    expect(card.breakdown.latencyScore).toBeLessThan(30);
    expect(card.flags).toContain('latency_over_budget');
  });

  it('flags a route breaching SLA', () => {
    seedRoute('GET /test', 100, 10, 100);
    setSLA('GET /test', { availability: 0.99, maxLatencyMs: 500 });
    const card = scoreRoute('GET /test');
    expect(card.flags).toContain('sla_breach');
    expect(card.breakdown.slaScore).toBe(0);
  });

  it('flags deprecated routes and reduces activity score', () => {
    seedRoute('GET /test', 100);
    deprecateRoute('GET /test', { reason: 'old', sunset: '2025-01-01' });
    const card = scoreRoute('GET /test');
    expect(card.flags).toContain('deprecated');
    expect(card.breakdown.activityScore).toBe(0);
  });

  it('flags routes with no traffic', () => {
    const card = scoreRoute('GET /unknown');
    expect(card.flags).toContain('no_traffic');
  });

  it('assigns correct grades', () => {
    seedRoute('GET /test', 50);
    setLatencyBudget('GET /test', { budgetMs: 500 });
    setSLA('GET /test', { availability: 0.99, maxLatencyMs: 500 });
    const card = scoreRoute('GET /test');
    expect(['A', 'B', 'C', 'D', 'F']).toContain(card.grade);
  });
});

describe('scoreAllRoutes', () => {
  it('returns scorecards for all tracked routes sorted by score ascending', () => {
    seedRoute('GET /fast', 50);
    seedRoute('GET /slow', 900);
    setLatencyBudget('GET /slow', { budgetMs: 200 });
    const cards = scoreAllRoutes();
    expect(cards.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < cards.length; i++) {
      expect(cards[i].score).toBeGreaterThanOrEqual(cards[i - 1].score);
    }
  });
});
