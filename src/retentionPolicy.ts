/**
 * Retention policy: automatically evict stale route metrics
 * based on a configurable TTL and maximum entry count.
 */

import { clearMetrics, getAllStats } from './metrics';

export interface RetentionPolicyConfig {
  /** Maximum age of a metric entry in milliseconds */
  maxAgeMs: number;
  /** Maximum number of route entries to retain */
  maxEntries: number;
  /** How often (ms) to run the eviction sweep */
  sweepIntervalMs: number;
}

const DEFAULT_CONFIG: RetentionPolicyConfig = {
  maxAgeMs: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 500,
  sweepIntervalMs: 60 * 1000, // 1 minute
};

let currentConfig: RetentionPolicyConfig = { ...DEFAULT_CONFIG };
let sweepTimer: ReturnType<typeof setInterval> | null = null;

/** Per-route last-seen timestamps (updated externally via touchRoute) */
const lastSeen: Map<string, number> = new Map();

export function configureRetentionPolicy(config: Partial<RetentionPolicyConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function getRetentionPolicyConfig(): RetentionPolicyConfig {
  return { ...currentConfig };
}

export function touchRoute(route: string): void {
  lastSeen.set(route, Date.now());
}

export function runEviction(): string[] {
  const now = Date.now();
  const stats = getAllStats();
  const evicted: string[] = [];

  // Evict by age
  for (const [route, ts] of lastSeen.entries()) {
    if (now - ts > currentConfig.maxAgeMs) {
      clearMetrics(route);
      lastSeen.delete(route);
      evicted.push(route);
    }
  }

  // Evict oldest entries if over maxEntries
  const remaining = Object.keys(getAllStats());
  if (remaining.length > currentConfig.maxEntries) {
    const sorted = remaining
      .map((r) => ({ route: r, ts: lastSeen.get(r) ?? 0 }))
      .sort((a, b) => a.ts - b.ts);
    const toRemove = sorted.slice(0, remaining.length - currentConfig.maxEntries);
    for (const { route } of toRemove) {
      clearMetrics(route);
      lastSeen.delete(route);
      evicted.push(route);
    }
  }

  return evicted;
}

export function startRetentionSweep(): void {
  if (sweepTimer !== null) return;
  sweepTimer = setInterval(runEviction, currentConfig.sweepIntervalMs);
}

export function stopRetentionSweep(): void {
  if (sweepTimer !== null) {
    clearInterval(sweepTimer);
    sweepTimer = null;
  }
}

export function resetRetentionPolicy(): void {
  stopRetentionSweep();
  currentConfig = { ...DEFAULT_CONFIG };
  lastSeen.clear();
}
