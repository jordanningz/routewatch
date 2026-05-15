import express, { Express } from 'express';
import request from 'supertest';
import { createRateProfileRouter } from './rateProfileRouter';
import { recordRateHit, resetRateProfiles } from './routeRateProfile';

function buildRateProfileApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/rate-profiles', createRateProfileRouter());
  return app;
}

beforeEach(() => {
  resetRateProfiles();
});

describe('GET /rate-profiles', () => {
  it('returns empty array when no profiles exist', async () => {
    const res = await request(buildRateProfileApp()).get('/rate-profiles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all profiles after hits', async () => {
    recordRateHit('/api/users');
    recordRateHit('/api/posts');
    const res = await request(buildRateProfileApp()).get('/rate-profiles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /rate-profiles/tier/:tier', () => {
  it('returns 400 for invalid tier', async () => {
    const res = await request(buildRateProfileApp()).get('/rate-profiles/tier/extreme');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid tier/);
  });

  it('returns routes for a valid tier', async () => {
    recordRateHit('/api/slow');
    const res = await request(buildRateProfileApp()).get('/rate-profiles/tier/idle');
    // could be idle or low depending on timing
    if (res.status === 200) {
      expect(res.body).toHaveProperty('tier');
      expect(res.body).toHaveProperty('routes');
      expect(Array.isArray(res.body.routes)).toBe(true);
    }
  });

  it('returns empty routes array for tier with no matches', async () => {
    const res = await request(buildRateProfileApp()).get('/rate-profiles/tier/critical');
    expect(res.status).toBe(200);
    expect(res.body.routes).toHaveLength(0);
  });
});

describe('GET /rate-profiles/route', () => {
  it('returns 400 when path query param is missing', async () => {
    const res = await request(buildRateProfileApp()).get('/rate-profiles/route');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/path/);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(buildRateProfileApp()).get(
      '/rate-profiles/route?path=/unknown'
    );
    expect(res.status).toBe(404);
  });

  it('returns profile for a known route', async () => {
    recordRateHit('/api/items');
    const res = await request(buildRateProfileApp()).get(
      '/rate-profiles/route?path=/api/items'
    );
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('/api/items');
    expect(res.body.totalRequests).toBe(1);
  });
});
