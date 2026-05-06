/**
 * Core types for routewatch middleware.
 */

import { Request, Response, NextFunction } from 'express';

export interface RouteWatchOptions {
  /** Threshold in ms above which a route is considered slow. Default: 500 */
  slowThreshold?: number;
  /** Alert handlers to invoke when a slow route is detected */
  alertHandlers?: AlertHandler[];
  /** Sampling configuration */
  sampling?: Partial<SamplingConfig>;
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
  count: number;
  avgDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  p95DurationMs: number;
  slowCount: number;
}

export interface AlertPayload {
  route: string;
  method: string;
  durationMs: number;
  threshold: number;
  timestamp: number;
}

export type AlertHandler = (payload: AlertPayload) => void | Promise<void>;

export interface MetricsReporterOptions {
  /** Secret token required in Authorization header */
  authToken?: string;
  /** Path to mount the metrics router. Default: '/routewatch' */
  mountPath?: string;
}

/** Sampling configuration */
export interface SamplingConfig {
  /** Global sample rate between 0 and 1. Default: 1.0 (100%) */
  rate: number;
  /** Per-route overrides, keyed by route path */
  perRoute: Record<string, number>;
}
