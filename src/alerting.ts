import { RouteWatchAlert, AlertHandler } from './types';

/**
 * Default alert handler that logs slow route warnings to stderr.
 */
export const defaultAlertHandler: AlertHandler = (alert: RouteWatchAlert): void => {
  const timestamp = new Date(alert.timestamp).toISOString();
  console.warn(
    `[routewatch] SLOW ROUTE DETECTED | ${timestamp} | ${alert.method} ${alert.path} | ${alert.duration}ms (threshold: ${alert.threshold}ms)`
  );
};

/**
 * Creates an alert object for a slow route.
 */
export function createAlert(
  method: string,
  path: string,
  duration: number,
  threshold: number
): RouteWatchAlert {
  return {
    method: method.toUpperCase(),
    path,
    duration,
    threshold,
    timestamp: Date.now(),
  };
}

/**
 * Determines whether a route duration exceeds the configured threshold.
 */
export function isSlowRoute(duration: number, threshold: number): boolean {
  return duration > threshold;
}

/**
 * Composes multiple alert handlers into a single handler.
 */
export function composeAlertHandlers(...handlers: AlertHandler[]): AlertHandler {
  return (alert: RouteWatchAlert): void => {
    for (const handler of handlers) {
      try {
        handler(alert);
      } catch (err) {
        console.error('[routewatch] Alert handler threw an error:', err);
      }
    }
  };
}
