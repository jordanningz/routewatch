import { getRouteStats } from './metrics';
import { computePercentileStats } from './percentiles';

export interface AnomalyDetectionConfig {
  zScoreThreshold: number;
  minSampleSize: number;
  enabled: boolean;
}

export interface AnomalyResult {
  route: string;
  latency: number;
  mean: number;
  stdDev: number;
  zScore: number;
  isAnomaly: boolean;
}

let config: AnomalyDetectionConfig = {
  zScoreThreshold: 3.0,
  minSampleSize: 10,
  enabled: true,
};

export function configureAnomalyDetection(opts: Partial<AnomalyDetectionConfig>): void {
  config = { ...config, ...opts };
}

export function getAnomalyDetectionConfig(): AnomalyDetectionConfig {
  return { ...config };
}

export function resetAnomalyDetectionConfig(): void {
  config = { zScoreThreshold: 3.0, minSampleSize: 10, enabled: true };
}

export function detectAnomaly(route: string, latency: number): AnomalyResult {
  const stats = getRouteStats(route);
  const result: AnomalyResult = {
    route,
    latency,
    mean: 0,
    stdDev: 0,
    zScore: 0,
    isAnomaly: false,
  };

  if (!config.enabled || !stats || stats.count < config.minSampleSize) {
    return result;
  }

  const pStats = computePercentileStats(stats.durations);
  const mean = stats.avg;
  const stdDev = pStats.stdDev ?? 0;

  if (stdDev === 0) return { ...result, mean };

  const zScore = (latency - mean) / stdDev;
  const isAnomaly = Math.abs(zScore) > config.zScoreThreshold;

  return { route, latency, mean, stdDev, zScore, isAnomaly };
}

export function scanAllRoutesForAnomalies(latencyMap: Record<string, number>): AnomalyResult[] {
  return Object.entries(latencyMap).map(([route, latency]) =>
    detectAnomaly(route, latency)
  );
}
