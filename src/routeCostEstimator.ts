/**
 * routeCostEstimator.ts
 * Assigns and tracks computational cost estimates per route,
 * useful for capacity planning and prioritization.
 */

export type CostUnit = 'low' | 'medium' | 'high' | 'critical';

export interface RouteCostEstimate {
  route: string;
  cpuWeight: number;      // relative CPU cost, 1–10
  memoryWeight: number;   // relative memory cost, 1–10
  ioWeight: number;       // relative I/O cost, 1–10
  label: CostUnit;
  notes?: string;
  updatedAt: string;
}

const costStore = new Map<string, RouteCostEstimate>();

function deriveCostLabel(avg: number): CostUnit {
  if (avg <= 2.5) return 'low';
  if (avg <= 5)   return 'medium';
  if (avg <= 7.5) return 'high';
  return 'critical';
}

export function setCostEstimate(
  route: string,
  cpuWeight: number,
  memoryWeight: number,
  ioWeight: number,
  notes?: string
): RouteCostEstimate {
  if ([cpuWeight, memoryWeight, ioWeight].some(w => w < 1 || w > 10)) {
    throw new RangeError('Weights must be between 1 and 10');
  }
  const avg = (cpuWeight + memoryWeight + ioWeight) / 3;
  const estimate: RouteCostEstimate = {
    route,
    cpuWeight,
    memoryWeight,
    ioWeight,
    label: deriveCostLabel(avg),
    notes,
    updatedAt: new Date().toISOString(),
  };
  costStore.set(route, estimate);
  return estimate;
}

export function getCostEstimate(route: string): RouteCostEstimate | undefined {
  return costStore.get(route);
}

export function removeCostEstimate(route: string): boolean {
  return costStore.delete(route);
}

export function getAllCostEstimates(): RouteCostEstimate[] {
  return Array.from(costStore.values());
}

export function getRoutesByCostLabel(label: CostUnit): RouteCostEstimate[] {
  return getAllCostEstimates().filter(e => e.label === label);
}

export function computeTotalCostScore(route: string): number | undefined {
  const est = costStore.get(route);
  if (!est) return undefined;
  return est.cpuWeight + est.memoryWeight + est.ioWeight;
}

export function resetCostEstimates(): void {
  costStore.clear();
}
