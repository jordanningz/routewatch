import { Request, Response, NextFunction } from 'express';
import { getDeprecation, isSunset, buildDeprecationHeader } from './routeDeprecation';
import { getAlias } from './routeAlias';

export interface DeprecationMiddlewareOptions {
  /** Block requests to sunset routes (default: false) */
  blockSunset?: boolean;
  /** Custom header name (default: 'Deprecation') */
  headerName?: string;
  /** Log deprecation warnings (default: true) */
  logWarnings?: boolean;
}

export function createDeprecationMiddleware(options: DeprecationMiddlewareOptions = {}) {
  const {
    blockSunset = false,
    headerName = 'Deprecation',
    logWarnings = true,
  } = options;

  return function deprecationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const route = req.route?.path as string | undefined;
    const pattern = route ?? getAlias(req.path) ?? req.path;

    const entry = getDeprecation(pattern);
    if (!entry) {
      return next();
    }

    if (blockSunset && isSunset(pattern)) {
      res.status(410).json({
        error: 'Gone',
        message: entry.message,
        replacement: entry.replacement ?? null,
      });
      return;
    }

    const headerValue = buildDeprecationHeader(entry);
    res.setHeader(headerName, headerValue);

    if (entry.replacement) {
      res.setHeader('Link', `<${entry.replacement}>; rel="successor-version"`);
    }

    if (logWarnings) {
      console.warn(
        `[routewatch] Deprecated route accessed: ${pattern} — ${entry.message}`
      );
    }

    next();
  };
}
