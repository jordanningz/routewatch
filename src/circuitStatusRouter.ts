import { Router, Request, Response } from 'express';
import {
  getAllCircuitStatuses,
  getCircuitStatusForRoute,
  getTrippedCircuits,
} from './routeCircuitStatus';
import { authMiddleware } from './metricsReporter';

export function createCircuitStatusRouter(secret?: string): Router {
  const router = Router();
  const auth = authMiddleware(secret);

  router.get('/', auth, (_req: Request, res: Response) => {
    const snapshot = getAllCircuitStatuses();
    res.json(snapshot);
  });

  router.get('/tripped', auth, (_req: Request, res: Response) => {
    const tripped = getTrippedCircuits();
    res.json({ count: tripped.length, routes: tripped });
  });

  router.get('/:route(*)', auth, (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    const entry = getCircuitStatusForRoute(route);
    res.json(entry);
  });

  return router;
}
