/**
 * Utility functions for computing percentile statistics from response time data.
 */

/**
 * Sorts an array of numbers and returns the value at the given percentile.
 * @param values - Array of numeric values (e.g. response times in ms)
 * @param percentile - A number between 0 and 100
 */
export function computePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new RangeError(`Percentile must be between 0 and 100, got ${percentile}`);
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

export interface PercentileStats {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

/**
 * Computes a standard set of percentiles (p50, p75, p90, p95, p99) for the given values.
 */
export function computePercentileStats(values: number[]): PercentileStats {
  return {
    p50: computePercentile(values, 50),
    p75: computePercentile(values, 75),
    p90: computePercentile(values, 90),
    p95: computePercentile(values, 95),
    p99: computePercentile(values, 99),
  };
}

/**
 * Returns a human-readable summary string for a set of percentile stats.
 */
export function formatPercentileStats(stats: PercentileStats): string {
  return (
    `p50=${stats.p50.toFixed(1)}ms ` +
    `p75=${stats.p75.toFixed(1)}ms ` +
    `p90=${stats.p90.toFixed(1)}ms ` +
    `p95=${stats.p95.toFixed(1)}ms ` +
    `p99=${stats.p99.toFixed(1)}ms`
  );
}
