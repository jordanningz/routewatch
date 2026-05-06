import {
  configureAnomalyDetection,
  detectAnomaly,
  getAnomalyDetectionConfig,
  resetAnomalyDetectionConfig,
  scanAllRoutesForAnomalies,
} from './anomalyDetection';
import { recordMetric, clearMetrics } from './metrics';

function seedRoute(route: string, durations: number[]) {
  durations.forEach((d) => recordMetric(route, d, 200));
}

beforeEach(() => {
  clearMetrics();
  resetAnomalyDetectionConfig();
});

describe('configureAnomalyDetection', () => {
  it('updates config fields', () => {
    configureAnomalyDetection({ zScoreThreshold: 2.5, minSampleSize: 5 });
    const cfg = getAnomalyDetectionConfig();
    expect(cfg.zScoreThreshold).toBe(2.5);
    expect(cfg.minSampleSize).toBe(5);
  });

  it('resets to defaults', () => {
    configureAnomalyDetection({ zScoreThreshold: 1.0 });
    resetAnomalyDetectionConfig();
    expect(getAnomalyDetectionConfig().zScoreThreshold).toBe(3.0);
  });
});

describe('detectAnomaly', () => {
  it('returns isAnomaly false when not enough samples', () => {
    seedRoute('/api/test', [100, 110]);
    const result = detectAnomaly('/api/test', 500);
    expect(result.isAnomaly).toBe(false);
  });

  it('detects anomaly on high z-score', () => {
    const base = Array.from({ length: 20 }, () => 100);
    seedRoute('/api/slow', base);
    const result = detectAnomaly('/api/slow', 5000);
    expect(result.isAnomaly).toBe(true);
    expect(result.zScore).toBeGreaterThan(3);
  });

  it('does not flag normal latency as anomaly', () => {
    const base = Array.from({ length: 20 }, (_, i) => 100 + i);
    seedRoute('/api/normal', base);
    const result = detectAnomaly('/api/normal', 105);
    expect(result.isAnomaly).toBe(false);
  });

  it('returns isAnomaly false when disabled', () => {
    configureAnomalyDetection({ enabled: false });
    const base = Array.from({ length: 20 }, () => 100);
    seedRoute('/api/disabled', base);
    const result = detectAnomaly('/api/disabled', 9999);
    expect(result.isAnomaly).toBe(false);
  });
});

describe('scanAllRoutesForAnomalies', () => {
  it('returns results for each route in the map', () => {
    const results = scanAllRoutesForAnomalies({ '/a': 200, '/b': 300 });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.route)).toContain('/a');
  });
});
