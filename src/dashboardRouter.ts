import { Router, Request, Response } from 'express';
import { buildDashboardSnapshot, getDashboardSummary } from './dashboard';
import { authMiddleware } from './metricsReporter';
import { getRoutesByTag } from './tags';

export function createDashboardRouter(secret?: string): Router {
  const router = Router();
  const auth = authMiddleware(secret);

  router.get('/dashboard', auth, (_req: Request, res: Response) => {
    const snapshot = buildDashboardSnapshot();
    res.json(snapshot);
  });

  router.get('/dashboard/summary', auth, (_req: Request, res: Response) => {
    const summary = getDashboardSummary();
    res.json(summary);
  });

  router.get(
    '/dashboard/tag/:tag',
    auth,
    (req: Request, res: Response) => {
      const { tag } = req.params;
      const routes = getRoutesByTag(tag);
      const snapshot = buildDashboardSnapshot();
      const filtered = snapshot.routes.filter((r) => routes.includes(r.route));
      res.json({ tag, routes: filtered });
    }
  );

  router.get(
    '/dashboard/anomalies',
    auth,
    (_req: Request, res: Response) => {
      const snapshot = buildDashboardSnapshot();
      const anomalies = snapshot.routes.filter((r) => r.isAnomaly);
      res.json({ count: anomalies.length, routes: anomalies });
    }
  );

  return router;
}
