import { Request, Response, NextFunction } from 'express';
import { RouteWatchOptions, SlowRouteAlert } from './types';

const DEFAULT_THRESHOLD_MS = 500;

export function routewatch(options: RouteWatchOptions = {}) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD_MS;
  const onAlert = options.onAlert;
  const logger = options.logger ?? console;

  return function routewatchMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const startTime = process.hrtime.bigint();
    const route = `${req.method} ${req.path}`;

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;

      if (options.logAll) {
        logger.log(`[routewatch] ${route} — ${durationMs.toFixed(2)}ms`);
      }

      if (durationMs > threshold) {
        const alert: SlowRouteAlert = {
          route,
          method: req.method,
          path: req.path,
          durationMs: parseFloat(durationMs.toFixed(2)),
          threshold,
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode,
        };

        logger.warn(
          `[routewatch] SLOW ROUTE detected: ${route} took ${durationMs.toFixed(2)}ms (threshold: ${threshold}ms)`
        );

        if (onAlert) {
          onAlert(alert);
        }
      }
    });

    next();
  };
}
