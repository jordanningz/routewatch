import express, { Express } from 'express';
import request from 'supertest';
import { createSLARouter } from './slaRouter';
import { resetSLAs, setSLA } from './routeSLA';
import { clearMetrics, recordMetric } from './metrics';

function buildSLAApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/sla', createSLARouter());
  return app;
}

beforeEach(() => {
  resetSLAs();
  clearMetrics();
});

describe('GET /sla', () => {
  it('returns empty object when no SLAs configured', async () => {
    const res = await request(buildSLAApp()).get('/sla');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns all configured SLAs', async () => {
    setSLA('/api/users', { maxP95Ms: 200, maxErrorRate: 0.01, minAvailability: 0.99 });
    const res = await request(buildSLAApp()).get('/sla');
    expect(res.status).toBe(200);
    expect(res.body['/api/users']).toBeDefined();
  });
});

describe('GET /sla/status', () => {
  it('returns passing true when no SLAs are configured', async () => {
    const res = await request(buildSLAApp()).get('/sla/status');
    expect(res.status).toBe(200);
    expect(res.body.passing).toBe(true);
  });

  it('reflects failing SLAs in the response', async () => {
    setSLA('/api/slow', { maxP95Ms: 10, maxErrorRate: 0.01, minAvailability: 0.99 });
    recordMetric('/api/slow', 500, 200);
    const res = await request(buildSLAApp()).get('/sla/status');
    expect(res.body.statuses[0].passing).toBe(false);
  });
});

describe('PUT /sla/:route', () => {
  it('creates a new SLA config', async () => {
    const res = await request(buildSLAApp())
      .put('/sla/api/orders')
      .send({ maxP95Ms: 300, maxErrorRate: 0.05, minAvailability: 0.95 });
    expect(res.status).toBe(201);
    expect(res.body.config.maxP95Ms).toBe(300);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(buildSLAApp())
      .put('/sla/api/orders')
      .send({ maxP95Ms: 300 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /sla/:route', () => {
  it('removes an existing SLA', async () => {
    setSLA('/api/users', { maxP95Ms: 200, maxErrorRate: 0.01, minAvailability: 0.99 });
    const res = await request(buildSLAApp()).delete('/sla/api/users');
    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(buildSLAApp()).delete('/sla/api/ghost');
    expect(res.status).toBe(404);
  });
});
