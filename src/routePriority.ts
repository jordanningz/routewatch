/**
 * Route Priority — assign priority levels to routes for triage and alerting.
 */

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RoutePriorityEntry {
  pattern: string;
  priority: PriorityLevel;
  reason?: string;
  setAt: number;
}

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const priorityMap = new Map<string, RoutePriorityEntry>();

export function setRoutePriority(
  pattern: string,
  priority: PriorityLevel,
  reason?: string
): RoutePriorityEntry {
  const entry: RoutePriorityEntry = { pattern, priority, reason, setAt: Date.now() };
  priorityMap.set(pattern, entry);
  return entry;
}

export function getRoutePriority(pattern: string): RoutePriorityEntry | undefined {
  return priorityMap.get(pattern);
}

export function removeRoutePriority(pattern: string): boolean {
  return priorityMap.delete(pattern);
}

export function getAllPriorities(): RoutePriorityEntry[] {
  return Array.from(priorityMap.values());
}

export function getRoutesByPriority(priority: PriorityLevel): RoutePriorityEntry[] {
  return getAllPriorities().filter((e) => e.priority === priority);
}

export function comparePriority(a: PriorityLevel, b: PriorityLevel): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

export function getEffectivePriority(pattern: string): PriorityLevel {
  return priorityMap.get(pattern)?.priority ?? 'medium';
}

export function resetPriorities(): void {
  priorityMap.clear();
}
