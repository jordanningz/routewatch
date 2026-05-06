import express, { Express } from 'express';
import request from 'supertest';
import { createDashboardRouter } from './dashboardRouter';
import { recordMetric, clearMetrics } from './metrics';
import { tagRoute, resetTags } from './tags';

function buildDashboardApp(secret?: string): Express {
  const app = express();
  app.use(createDashboardRouter(secret));
  return app;
}

beforeEach(() => {
  clearMetrics();
  resetTags();
});

describe('GET /dashboard', () => {
  it('returns 200 with snapshot', async () => {
    recordMetric('GET /api/users', 150, 200);
    const res = await request(buildDashboardApp()).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.routes).toBeDefined();
    expect(res.body.totalRoutes).toBe(1);
  });

  it('returns 401 when secret required and missing', async () => {
    const res = await request(buildDashboardApp('mysecret')).get('/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid secret', async () => {
    const res = await request(buildDashboardApp('mysecret'))
      .get('/dashboard')
      .set('x-api-key', 'mysecret');
    expect(res.status).toBe(200);
  });
});

describe('GET /dashboard/summary', () => {
  it('returns summary object', async () => {
    const res = await request(buildDashboardApp()).get('/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.totalRoutes).toBeDefined();
    expect(res.body.anomalyCount).toBeDefined();
  });
});

describe('GET /dashboard/tag/:tag', () => {
  it('returns routes for a given tag', async () => {
    recordMetric('GET /api/orders', 100, 200);
    tagRoute('GET /api/orders', 'commerce');
    const res = await request(buildDashboardApp()).get('/dashboard/tag/commerce');
    expect(res.status).toBe(200);
    expect(res.body.tag).toBe('commerce');
    expect(res.body.routes).toHaveLength(1);
  });

  it('returns empty routes for unknown tag', async () => {
    const res = await request(buildDashboardApp()).get('/dashboard/tag/unknown');
    expect(res.status).toBe(200);
    expect(res.body.routes).toHaveLength(0);
  });
});

describe('GET /dashboard/anomalies', () => {
  it('returns anomaly route list', async () => {
    const res = await request(buildDashboardApp()).get('/dashboard/anomalies');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeDefined();
    expect(Array.isArray(res.body.routes)).toBe(true);
  });
});
