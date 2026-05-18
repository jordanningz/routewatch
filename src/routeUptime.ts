/**
 * routeUptime.ts
 * Tracks uptime/downtime windows for routes based on error rate thresholds.
 */

export interface UptimeConfig {
  errorRateThreshold: number; // 0–1, fraction of requests considered errors
  windowSize: number;         // number of recent requests to evaluate
}

export interface UptimeRecord {
  route: string;
  isUp: boolean;
  uptimeSince: number;   // timestamp (ms) when current status began
  totalUpMs: number;
  totalDownMs: number;
  lastChecked: number;
}

const DEFAULT_CONFIG: UptimeConfig = {
  errorRateThreshold: 0.5,
  windowSize: 20,
};

let config: UptimeConfig = { ...DEFAULT_CONFIG };

// route -> circular buffer of booleans (true = success)
const requestWindows = new Map<string, boolean[]>();
const uptimeRecords = new Map<string, UptimeRecord>();

export function configureRouteUptime(opts: Partial<UptimeConfig>): void {
  config = { ...config, ...opts };
}

export function getRouteUptimeConfig(): UptimeConfig {
  return { ...config };
}

export function resetRouteUptime(): void {
  config = { ...DEFAULT_CONFIG };
  requestWindows.clear();
  uptimeRecords.clear();
}

export function recordRequest(route: string, success: boolean): void {
  if (!requestWindows.has(route)) {
    requestWindows.set(route, []);
  }
  const window = requestWindows.get(route)!;
  window.push(success);
  if (window.length > config.windowSize) {
    window.shift();
  }

  const errorRate = window.filter(s => !s).length / window.length;
  const isUp = errorRate < config.errorRateThreshold;
  const now = Date.now();

  const existing = uptimeRecords.get(route);
  if (!existing) {
    uptimeRecords.set(route, {
      route,
      isUp,
      uptimeSince: now,
      totalUpMs: 0,
      totalDownMs: 0,
      lastChecked: now,
    });
    return;
  }

  const elapsed = now - existing.lastChecked;
  if (existing.isUp) {
    existing.totalUpMs += elapsed;
  } else {
    existing.totalDownMs += elapsed;
  }

  if (existing.isUp !== isUp) {
    existing.uptimeSince = now;
  }
  existing.isUp = isUp;
  existing.lastChecked = now;
}

export function getUptimeRecord(route: string): UptimeRecord | undefined {
  return uptimeRecords.get(route);
}

export function getAllUptimeRecords(): UptimeRecord[] {
  return Array.from(uptimeRecords.values());
}

export function getUptimePercentage(route: string): number | null {
  const record = uptimeRecords.get(route);
  if (!record) return null;
  const total = record.totalUpMs + record.totalDownMs;
  if (total === 0) return record.isUp ? 100 : 0;
  return (record.totalUpMs / total) * 100;
}
