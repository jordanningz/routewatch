/**
 * Route Latency Budget
 * Define per-route SLO latency budgets and track budget consumption.
 */

export interface LatencyBudgetConfig {
  budgetMs: number;
  warningThresholdPct: number; // e.g. 0.8 = warn when 80% of budget consumed
}

export interface BudgetStatus {
  route: string;
  budgetMs: number;
  p99Ms: number | null;
  consumedPct: number | null;
  status: 'ok' | 'warning' | 'exceeded' | 'no-data';
}

const budgets = new Map<string, LatencyBudgetConfig>();

export function setLatencyBudget(route: string, config: LatencyBudgetConfig): void {
  if (config.budgetMs <= 0) throw new Error('budgetMs must be positive');
  if (config.warningThresholdPct <= 0 || config.warningThresholdPct >= 1) {
    throw new Error('warningThresholdPct must be between 0 and 1 (exclusive)');
  }
  budgets.set(route, { ...config });
}

export function getLatencyBudget(route: string): LatencyBudgetConfig | undefined {
  return budgets.get(route);
}

export function removeLatencyBudget(route: string): boolean {
  return budgets.delete(route);
}

export function getAllLatencyBudgets(): Record<string, LatencyBudgetConfig> {
  const result: Record<string, LatencyBudgetConfig> = {};
  for (const [route, config] of budgets.entries()) {
    result[route] = { ...config };
  }
  return result;
}

export function resetLatencyBudgets(): void {
  budgets.clear();
}

export function evaluateBudget(route: string, p99Ms: number | null): BudgetStatus {
  const config = budgets.get(route);
  if (!config) {
    return { route, budgetMs: 0, p99Ms, consumedPct: null, status: 'no-data' };
  }
  if (p99Ms === null) {
    return { route, budgetMs: config.budgetMs, p99Ms: null, consumedPct: null, status: 'no-data' };
  }
  const consumedPct = p99Ms / config.budgetMs;
  let status: BudgetStatus['status'];
  if (consumedPct > 1) {
    status = 'exceeded';
  } else if (consumedPct >= config.warningThresholdPct) {
    status = 'warning';
  } else {
    status = 'ok';
  }
  return { route, budgetMs: config.budgetMs, p99Ms, consumedPct, status };
}

export function evaluateAllBudgets(
  statsProvider: (route: string) => { p99?: number } | undefined
): BudgetStatus[] {
  return Array.from(budgets.keys()).map((route) => {
    const stats = statsProvider(route);
    const p99Ms = stats?.p99 ?? null;
    return evaluateBudget(route, p99Ms);
  });
}
