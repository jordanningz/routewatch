import { AlertHandler } from './alerting';

export interface RouteWatchOptions {
  /** Duration in ms above which a route is considered slow. Default: 500 */
  slowThreshold?: number;
  /** List of alert handler functions to invoke on slow routes */
  alertHandlers?: AlertHandler[];
  /** Override the global sample rate for this middleware instance (0–1) */
  sampleRate?: number;
  /** Enable per-route rate limiting. Default: false */
  enableRateLimit?: boolean;
  /** Enable circuit breaker protection. Default: false */
  enableCircuitBreaker?: boolean;
}

export interface RouteMetric {
  route: string;
  duration: number;
  timestamp: Date;
  correlationId?: string;
}

export interface RouteStats {
  route: string;
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  durations: number[];
}

export interface AlertPayload {
  route: string;
  duration: number;
  threshold: number;
  timestamp: Date;
  correlationId?: string;
}

export interface DashboardSnapshot {
  generatedAt: Date;
  totalRoutes: number;
  totalRequests: number;
  slowRoutes: SlowRouteSummary[];
  topRoutes: RouteStats[];
}

export interface SlowRouteSummary {
  route: string;
  avgDuration: number;
  maxDuration: number;
  count: number;
}

export interface MetricsFilter {
  route?: string;
  minCount?: number;
  minAvgDuration?: number;
}

export interface PercentileStats {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface AnomalyDetectionConfig {
  zScoreThreshold?: number;
  minSamples?: number;
}

export interface AnomalyResult {
  route: string;
  isAnomaly: boolean;
  zScore: number;
  latestDuration: number;
  mean: number;
  stdDev: number;
}
