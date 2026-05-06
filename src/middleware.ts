/**
 * Core routewatch middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { RouteWatchOptions } from './types';
import { recordMetric } from './metrics';
import { isSlowRoute, composeAlertHandlers, createAlert } from './alerting';
import { shouldSample, configureSampling } from './sampling';

const DEFAULT_SLOW_THRESHOLD = 500;

export function routewatch(options: RouteWatchOptions = {}) {
  const threshold = options.slowThreshold ?? DEFAULT_SLOW_THRESHOLD;
  const alertHandler = options.alertHandlers
    ? composeAlertHandlers(options.alertHandlers)
    : null;

  if (options.sampling) {
    configureSampling(options.sampling);
  }

  return function routewatchMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const start = Date.now();
    const route = req.path;

    if (!shouldSample(route)) {
      return next();
    }

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const metric = {
        route,
        method: req.method,
        statusCode: res.statusCode,
        durationMs,
        timestamp: start,
      };

      recordMetric(metric);

      if (alertHandler && isSlowRoute(durationMs, threshold)) {
        const alert = createAlert(route, req.method, durationMs, threshold);
        alertHandler(alert);
      }
    });

    next();
  };
}
