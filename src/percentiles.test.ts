import {
  computePercentile,
  computePercentileStats,
  formatPercentileStats,
} from "./percentiles";

describe("computePercentile", () => {
  it("returns 0 for an empty array", () => {
    expect(computePercentile([], 50)).toBe(0);
  });

  it("throws for out-of-range percentile", () => {
    expect(() => computePercentile([100], -1)).toThrow(RangeError);
    expect(() => computePercentile([100], 101)).toThrow(RangeError);
  });

  it("returns the single value for a one-element array", () => {
    expect(computePercentile([42], 50)).toBe(42);
    expect(computePercentile([42], 99)).toBe(42);
  });

  it("returns the median of an odd-length sorted array", () => {
    expect(computePercentile([10, 20, 30, 40, 50], 50)).toBe(30);
  });

  it("interpolates between values for non-exact percentiles", () => {
    // For [10, 20], p50 index = 0.5 → interpolated between 10 and 20
    expect(computePercentile([10, 20], 50)).toBe(15);
  });

  it("handles unsorted input by sorting internally", () => {
    expect(computePercentile([50, 10, 30, 20, 40], 50)).toBe(30);
  });

  it("returns the maximum for p100", () => {
    expect(computePercentile([5, 15, 25, 35], 100)).toBe(35);
  });
});

describe("computePercentileStats", () => {
  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  it("returns an object with p50, p75, p90, p95, p99 keys", () => {
    const stats = computePercentileStats(values);
    expect(stats).toHaveProperty("p50");
    expect(stats).toHaveProperty("p75");
    expect(stats).toHaveProperty("p90");
    expect(stats).toHaveProperty("p95");
    expect(stats).toHaveProperty("p99");
  });

  it("p50 <= p75 <= p90 <= p95 <= p99", () => {
    const stats = computePercentileStats(values);
    expect(stats.p50).toBeLessThanOrEqual(stats.p75);
    expect(stats.p75).toBeLessThanOrEqual(stats.p90);
    expect(stats.p90).toBeLessThanOrEqual(stats.p95);
    expect(stats.p95).toBeLessThanOrEqual(stats.p99);
  });

  it("returns all zeros for empty input", () => {
    const stats = computePercentileStats([]);
    expect(stats).toEqual({ p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 });
  });
});

describe("formatPercentileStats", () => {
  it("formats stats into a readable string", () => {
    const stats = { p50: 10, p75: 20, p90: 30, p95: 40, p99: 50 };
    const result = formatPercentileStats(stats);
    expect(result).toBe(
      "p50=10.0ms p75=20.0ms p90=30.0ms p95=40.0ms p99=50.0ms"
    );
  });
});
