import { Router, Request, Response } from 'express';
import {
  setSLA,
  getSLA,
  removeSLA,
  getAllSLAs,
  checkSLA,
  checkAllSLAs,
  SLAConfig,
} from './routeSLA';

export function createSLARouter(): Router {
  const router = Router();

  // GET /sla — list all SLA configs
  router.get('/', (_req: Request, res: Response) => {
    res.json(getAllSLAs());
  });

  // GET /sla/status — check all SLAs against current metrics
  router.get('/status', (_req: Request, res: Response) => {
    const statuses = checkAllSLAs();
    const anyFailing = statuses.some(s => !s.passing);
    res.status(anyFailing ? 200 : 200).json({ passing: !anyFailing, statuses });
  });

  // GET /sla/:route — get SLA config for a single route
  router.get('/:route(*)', (req: Request, res: Response) => {
    const route = '/' + req.params['route'];
    const config = getSLA(route);
    if (!config) {
      res.status(404).json({ error: `No SLA configured for route: ${route}` });
      return;
    }
    const status = checkSLA(route);
    res.json({ route, config, status });
  });

  // PUT /sla/:route — set or update SLA for a route
  router.put('/:route(*)', (req: Request, res: Response) => {
    const route = '/' + req.params['route'];
    const { maxP95Ms, maxErrorRate, minAvailability } = req.body as Partial<SLAConfig>;

    if (maxP95Ms === undefined || maxErrorRate === undefined || minAvailability === undefined) {
      res.status(400).json({ error: 'maxP95Ms, maxErrorRate, and minAvailability are required' });
      return;
    }

    setSLA(route, { maxP95Ms, maxErrorRate, minAvailability });
    res.status(201).json({ route, config: getSLA(route) });
  });

  // DELETE /sla/:route — remove SLA for a route
  router.delete('/:route(*)', (req: Request, res: Response) => {
    const route = '/' + req.params['route'];
    if (!getSLA(route)) {
      res.status(404).json({ error: `No SLA configured for route: ${route}` });
      return;
    }
    removeSLA(route);
    res.status(204).send();
  });

  return router;
}
