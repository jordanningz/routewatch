import { RouteStats } from './types';

export interface AccessLogEntry {
  route: string;
  method: string;
  timestamp: number;
  durationMs: number;
  statusCode: number;
  correlationId?: string;
}

export interface AccessLogConfig {
  maxEntries: number;
  ttlMs: number;
}

const DEFAULT_CONFIG: AccessLogConfig = {
  maxEntries: 1000,
  ttlMs: 60 * 60 * 1000, // 1 hour
};

let config: AccessLogConfig = { ...DEFAULT_CONFIG };
let accessLog: AccessLogEntry[] = [];

export function configureAccessLog(opts: Partial<AccessLogConfig>): void {
  config = { ...DEFAULT_CONFIG, ...opts };
}

export function getAccessLogConfig(): AccessLogConfig {
  return { ...config };
}

export function resetAccessLog(): void {
  accessLog = [];
  config = { ...DEFAULT_CONFIG };
}

export function appendAccessLog(entry: AccessLogEntry): void {
  const now = Date.now();
  // Evict expired entries
  accessLog = accessLog.filter(e => now - e.timestamp < config.ttlMs);

  accessLog.push(entry);

  // Trim to maxEntries (keep most recent)
  if (accessLog.length > config.maxEntries) {
    accessLog = accessLog.slice(accessLog.length - config.maxEntries);
  }
}

export function getAccessLog(route?: string): AccessLogEntry[] {
  const now = Date.now();
  const live = accessLog.filter(e => now - e.timestamp < config.ttlMs);
  if (route !== undefined) {
    return live.filter(e => e.route === route);
  }
  return [...live];
}

export function getAccessLogByStatus(statusCode: number): AccessLogEntry[] {
  return getAccessLog().filter(e => e.statusCode === statusCode);
}

export function getAccessLogSummary(): Record<string, { count: number; avgDurationMs: number }> {
  const entries = getAccessLog();
  const summary: Record<string, { count: number; totalMs: number }> = {};

  for (const entry of entries) {
    const key = `${entry.method} ${entry.route}`;
    if (!summary[key]) summary[key] = { count: 0, totalMs: 0 };
    summary[key].count += 1;
    summary[key].totalMs += entry.durationMs;
  }

  return Object.fromEntries(
    Object.entries(summary).map(([key, val]) => [
      key,
      { count: val.count, avgDurationMs: Math.round(val.totalMs / val.count) },
    ])
  );
}
