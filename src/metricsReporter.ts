import { Request, Response, Router } from 'express';
import { getAllStats, getRouteStats } from './metrics';
import { RouteStats } from './types';

export interface MetricsReporterOptions {
  /** Path to mount the metrics endpoint. Defaults to '/__routewatch/metrics' */
  path?: string;
  /** Optional token required in Authorization header */
  authToken?: string;
}

function authMiddleware(token: string) {
  return (req: Request, res: Response, next: () => void) => {
    const provided = req.headers['authorization']?.replace('Bearer ', '');
    if (provided !== token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  };
}

export function createMetricsRouter(options: MetricsReporterOptions = {}): Router {
  const router = Router();
  const mountPath = options.path ?? '/__routewatch/metrics';

  const handlers: Array<(req: Request, res: Response, next: () => void) => void> = [];

  if (options.authToken) {
    handlers.push(authMiddleware(options.authToken));
  }

  handlers.push((_req: Request, res: Response) => {
    const stats: RouteStats[] = getAllStats();
    res.json({
      generatedAt: new Date().toISOString(),
      totalRoutes: stats.length,
      routes: stats.sort((a, b) => b.avgDurationMs - a.avgDurationMs),
    });
  });

  router.get(mountPath, ...handlers);

  router.get(`${mountPath}/:method/*`, (req: Request, res: Response) => {
    const method = req.params.method.toUpperCase();
    const route = '/' + (req.params as Record<string, string>)[0];
    const stats = getRouteStats(route, method);

    if (!stats) {
      res.status(404).json({ error: `No metrics found for ${method} ${route}` });
      return;
    }

    res.json(stats);
  });

  return router;
}
