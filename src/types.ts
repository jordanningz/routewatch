import { Request, Response, NextFunction } from 'express';

export interface RouteWatchOptions {
  slowThresholdMs?: number;
  alertHandlers?: AlertHandler[];
  sampleRate?: number;
  enableCircuitBreaker?: boolean;
}

export interface RouteMetric {
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

export interface RouteStats {
  route: string;
  requestCount: number;
  avgDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  errorCount: number;
}

export interface AlertPayload {
  route: string;
  method: string;
  durationMs: number;
  threshold: number;
  timestamp: number;
}

export type AlertHandler = (payload: AlertPayload) => void | Promise<void>;

export interface SamplingConfig {
  defaultRate: number;
  routeOverrides?: Record<string, number>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface WindowStats {
  route: string;
  requestCount: number;
  windowStart: number;
  windowEnd: number;
  isLimited: boolean;
}

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeMs: number;
  slowRequestThreshold: number;
}

export interface RouteCircuitState {
  state: CircuitBreakerState;
  failureCount: number;
  slowCount: number;
  lastFailureTime: number | null;
  openedAt: number | null;
}

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
