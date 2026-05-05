import express, { Express } from 'express';
import request from 'supertest';
import { createMetricsRouter } from './metricsReporter';
import { recordMetric, clearMetrics } from './metrics';

function buildReporterApp(options = {}): Express {
  const app = express();
  app.use(createMetricsRouter(options));
  return app;
}

describe('metricsReporter', () => {
  beforeEach(() => {
    clearMetrics();
  });

  describe('GET /__routewatch/metrics', () => {
    it('returns empty routes array when no metrics recorded', async () => {
      const res = await request(buildReporterApp()).get('/__routewatch/metrics');
      expect(res.status).toBe(200);
      expect(res.body.totalRoutes).toBe(0);
      expect(res.body.routes).toEqual([]);
    });

    it('returns recorded route stats sorted by avgDurationMs desc', async () => {
      recordMetric('/fast', 'GET', 50, 200);
      recordMetric('/slow', 'GET', 500, 200);
      const res = await request(buildReporterApp()).get('/__routewatch/metrics');
      expect(res.status).toBe(200);
      expect(res.body.routes[0].route).toBe('/slow');
      expect(res.body.routes[1].route).toBe('/fast');
    });

    it('includes generatedAt timestamp', async () => {
      const res = await request(buildReporterApp()).get('/__routewatch/metrics');
      expect(res.body.generatedAt).toBeDefined();
    });
  });

  describe('auth token protection', () => {
    const app = buildReporterApp({ authToken: 'secret123' });

    it('rejects requests without token', async () => {
      const res = await request(app).get('/__routewatch/metrics');
      expect(res.status).toBe(401);
    });

    it('accepts requests with correct token', async () => {
      const res = await request(app)
        .get('/__routewatch/metrics')
        .set('Authorization', 'Bearer secret123');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /__routewatch/metrics/:method/*', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(buildReporterApp()).get('/__routewatch/metrics/GET/api/unknown');
      expect(res.status).toBe(404);
    });

    it('returns stats for a specific route', async () => {
      recordMetric('/api/users', 'GET', 120, 200);
      const res = await request(buildReporterApp()).get('/__routewatch/metrics/GET/api/users');
      expect(res.status).toBe(200);
      expect(res.body.route).toBe('/api/users');
      expect(res.body.method).toBe('GET');
    });
  });
});
