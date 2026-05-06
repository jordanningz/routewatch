/**
 * Sampling module for routewatch.
 * Controls what percentage of requests are tracked to reduce overhead.
 */

import { SamplingConfig } from './types';

const DEFAULT_SAMPLE_RATE = 1.0; // 100%

let currentConfig: SamplingConfig = {
  rate: DEFAULT_SAMPLE_RATE,
  perRoute: {},
};

/**
 * Configure sampling rates globally and per-route.
 */
export function configureSampling(config: Partial<SamplingConfig>): void {
  currentConfig = {
    rate: config.rate ?? DEFAULT_SAMPLE_RATE,
    perRoute: config.perRoute ?? {},
  };
}

/**
 * Returns the effective sample rate for a given route.
 */
export function getSampleRate(route: string): number {
  const perRouteRate = currentConfig.perRoute[route];
  if (perRouteRate !== undefined) {
    return Math.min(1, Math.max(0, perRouteRate));
  }
  return Math.min(1, Math.max(0, currentConfig.rate));
}

/**
 * Determines whether a request for the given route should be sampled.
 */
export function shouldSample(route: string): boolean {
  const rate = getSampleRate(route);
  if (rate >= 1.0) return true;
  if (rate <= 0.0) return false;
  return Math.random() < rate;
}

/**
 * Reset sampling config back to defaults (useful in tests).
 */
export function resetSamplingConfig(): void {
  currentConfig = {
    rate: DEFAULT_SAMPLE_RATE,
    perRoute: {},
  };
}

export function getCurrentSamplingConfig(): SamplingConfig {
  return { ...currentConfig, perRoute: { ...currentConfig.perRoute } };
}
