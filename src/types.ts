import { Request, Response, NextFunction } from 'express';

/**
 * Configuration options for the routewatch middleware.
 */
export interface RouteWatchOptions {
  /**
   * Duration in milliseconds above which a route is considered slow.
   * @default 500
   */
  threshold?: number;

  /**
   * Custom alert handler invoked when a slow route is detected.
   * Defaults to logging to stderr.
   */
  onAlert?: AlertHandler;

  /**
   * Whether to skip logging for routes that match the given patterns.
   */
  ignore?: (string | RegExp)[];

  /**
   * Whether to attach timing headers (X-Response-Time) to responses.
   * @default false
   */
  responseTimeHeader?: boolean;
}

/**
 * Represents a single slow-route alert event.
 */
export interface RouteWatchAlert {
  /** HTTP method (e.g. GET, POST) */
  method: string;
  /** The matched route path */
  path: string;
  /** Measured response duration in milliseconds */
  duration: number;
  /** The threshold that was exceeded */
  threshold: number;
  /** Unix timestamp (ms) when the alert was generated */
  timestamp: number;
}

/**
 * A function that receives a slow-route alert and handles it.
 */
export type AlertHandler = (alert: RouteWatchAlert) => void;

/**
 * Express-compatible middleware signature.
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
