/**
 * rateProfileRouter.ts
 * Express router exposing route rate profile data via HTTP endpoints.
 */

import { Router, Request, Response } from 'express';
import {
  getAllRateProfiles,
  getRateProfile,
  getRoutesByRateTier,
  RateTier,
} from './routeRateProfile';

const VALID_TIERS: RateTier[] = ['idle', 'low', 'medium', 'high', 'critical'];

export function createRateProfileRouter(): Router {
  const router = Router();

  /**
   * GET /rate-profiles
   * Returns all tracked rate profiles.
   */
  router.get('/', (_req: Request, res: Response) => {
    res.json(getAllRateProfiles());
  });

  /**
   * GET /rate-profiles/tier/:tier
   * Returns routes matching a specific rate tier.
   */
  router.get('/tier/:tier', (req: Request, res: Response) => {
    const tier = req.params.tier as RateTier;
    if (!VALID_TIERS.includes(tier)) {
      return res.status(400).json({
        error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}`,
      });
    }
    const routes = getRoutesByRateTier(tier);
    res.json({ tier, routes });
  });

  /**
   * GET /rate-profiles/route?path=<route>
   * Returns the rate profile for a specific route.
   */
  router.get('/route', (req: Request, res: Response) => {
    const path = req.query.path as string | undefined;
    if (!path) {
      return res.status(400).json({ error: 'Query parameter "path" is required.' });
    }
    const profile = getRateProfile(path);
    if (!profile) {
      return res.status(404).json({ error: `No rate profile found for route: ${path}` });
    }
    res.json(profile);
  });

  return router;
}
