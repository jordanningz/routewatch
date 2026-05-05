export interface SlowRouteAlert {
  /** Full route string, e.g. "GET /api/users" */
  route: string;
  /** HTTP method */
  method: string;
  /** Request path */
  path: string;
  /** Measured duration in milliseconds */
  durationMs: number;
  /** Configured threshold in milliseconds */
  threshold: number;
  /** ISO timestamp when the alert was triggered */
  timestamp: string;
  /** HTTP response status code */
  statusCode: number;
}

export interface RouteWatchOptions {
  /**
   * Duration in milliseconds above which a route is considered slow.
   * @default 500
   */
  threshold?: number;

  /**
   * Callback invoked whenever a slow route is detected.
   */
  onAlert?: (alert: SlowRouteAlert) => void;

  /**
   * If true, log timing for every request, not just slow ones.
   * @default false
   */
  logAll?: boolean;

  /**
   * Custom logger. Must expose `log` and `warn` methods.
   * @default console
   */
  logger?: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
  };
}
