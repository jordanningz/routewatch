import { Request, Response, NextFunction } from 'express';
import { RouteWatchOptions } from './types';
import { recordMetric } from './metrics';
import { isSlowRoute, composeAlertHandlers } from './alerting';
import { shouldSample } from './sampling';
import { isRateLimited, recordRequest } from './rateLimit';
import { getCircuitState, recordFailure, recordSlowRequest, CircuitState } from './circuitBreaker';
import { touchRoute } from './retentionPolicy';
import { getCorrelationId } from './correlationId';

export function routewatch(options: RouteWatchOptions = {}) {
  const {
    slowThreshold = 500,
    alertHandlers = [],
    sampleRate,
    enableRateLimit = false,
    enableCircuitBreaker = false,
  } = options;

  const alert = composeAlertHandlers(alertHandlers);

  return function (req: Request, res: Response, next: NextFunction): void {
    if (!shouldSample(sampleRate)) {
      return next();
    }

    const route = req.path;

    if (enableRateLimit && isRateLimited(route)) {
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    const circuitState = enableCircuitBreaker ? getCircuitState(route) : null;
    if (circuitState === CircuitState.Open) {
      res.status(503).json({ error: 'Service Unavailable' });
      return;
    }

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = getCorrelationId(req);

      recordMetric(route, duration);
      touchRoute(route);

      if (enableRateLimit) {
        recordRequest(route);
      }

      if (enableCircuitBreaker) {
        if (res.statusCode >= 500) {
          recordFailure(route);
        } else if (isSlowRoute(duration, slowThreshold)) {
          recordSlowRequest(route);
        }
      }

      if (isSlowRoute(duration, slowThreshold)) {
        alert({
          route,
          duration,
          threshold: slowThreshold,
          timestamp: new Date(),
          correlationId,
        });
      }
    });

    next();
  };
}
