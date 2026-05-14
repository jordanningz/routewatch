import { getRouteStats } from './metrics';

export interface SLAConfig {
  maxP95Ms: number;
  maxErrorRate: number; // 0–1
  minAvailability: number; // 0–1
}

export interface SLAStatus {
  route: string;
  passing: boolean;
  violations: string[];
  config: SLAConfig;
}

const slaMap = new Map<string, SLAConfig>();

export function setSLA(route: string, config: SLAConfig): void {
  slaMap.set(route, config);
}

export function getSLA(route: string): SLAConfig | undefined {
  return slaMap.get(route);
}

export function removeSLA(route: string): void {
  slaMap.delete(route);
}

export function getAllSLAs(): Record<string, SLAConfig> {
  const result: Record<string, SLAConfig> = {};
  slaMap.forEach((config, route) => {
    result[route] = config;
  });
  return result;
}

export function resetSLAs(): void {
  slaMap.clear();
}

export function checkSLA(route: string): SLAStatus | null {
  const config = slaMap.get(route);
  if (!config) return null;

  const stats = getRouteStats(route);
  const violations: string[] = [];

  if (stats) {
    const p95 = stats.p95 ?? stats.avg;
    if (p95 > config.maxP95Ms) {
      violations.push(`p95 ${p95.toFixed(1)}ms exceeds limit of ${config.maxP95Ms}ms`);
    }

    const errorRate = stats.count > 0 ? (stats.errorCount ?? 0) / stats.count : 0;
    if (errorRate > config.maxErrorRate) {
      violations.push(`error rate ${(errorRate * 100).toFixed(1)}% exceeds limit of ${(config.maxErrorRate * 100).toFixed(1)}%`);
    }

    const availability = stats.count > 0 ? 1 - errorRate : 1;
    if (availability < config.minAvailability) {
      violations.push(`availability ${(availability * 100).toFixed(1)}% below minimum of ${(config.minAvailability * 100).toFixed(1)}%`);
    }
  }

  return { route, passing: violations.length === 0, violations, config };
}

export function checkAllSLAs(): SLAStatus[] {
  return Array.from(slaMap.keys())
    .map(route => checkSLA(route))
    .filter((s): s is SLAStatus => s !== null);
}
