import { Router, Request, Response } from 'express';
import {
  setRetryPolicy,
  getRetryPolicy,
  removeRetryPolicy,
  getAllRetryPolicies,
  hasRetryPolicy,
} from './routeRetryPolicy';

export function createRetryPolicyRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(getAllRetryPolicies());
  });

  router.get('/:route(*)', (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    if (!hasRetryPolicy(route)) {
      return res.status(404).json({ error: `No retry policy found for route: ${route}` });
    }
    res.json(getRetryPolicy(route));
  });

  router.put('/:route(*)', (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    const { maxRetries, backoffMs, retryOn } = req.body;
    const policy = setRetryPolicy(route, { maxRetries, backoffMs, retryOn });
    res.status(200).json(policy);
  });

  router.delete('/:route(*)', (req: Request, res: Response) => {
    const route = decodeURIComponent(req.params.route);
    const removed = removeRetryPolicy(route);
    if (!removed) {
      return res.status(404).json({ error: `No retry policy found for route: ${route}` });
    }
    res.json({ message: `Retry policy removed for route: ${route}` });
  });

  return router;
}
