import express from 'express';
import request from 'supertest';
import { createCircuitStatusRouter } from './circuitStatusRouter';
import { clearMetrics, recordMetric } from './metrics';
import {
  configureCircuitBreaker,
  resetCircuitBreaker,
  recordFailure,
} from './circuitBreaker';

function buildCircuitApp(secret?: string) {
  const app = express();
  app.use('/circuit-status', createCircuitStatusRouter(secret));
  return app;
}

beforeEach(() => {
  clearMetrics();
  resetCircuitBreaker();
  configureCircuitBreaker({ failureThreshold: 3, recoveryTimeMs: 5000 });
  recordMetric('/api/health', 50);
  recordMetric('/api/slow', 200);
  recordFailure('/api/slow');
  recordFailure('/api/slow');
  recordFailure('/api/slow');
});

describe('GET /circuit-status', () => {
  it('returns a snapshot of all circuit statuses', async () => {
    const res = await request(buildCircuitApp()).get('/circuit-status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('open');
    expect(res.body.routes).toBeInstanceOf(Array);
  });
});

describe('GET /circuit-status/tripped', () => {
  it('returns only open circuits', async () => {
    const res = await request(buildCircuitApp()).get('/circuit-status/tripped');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.routes[0].route).toBe('/api/slow');
  });
});

describe('GET /circuit-status/:route', () => {
  it('returns status for a specific route', async () => {
    const res = await request(buildCircuitApp()).get(
      '/circuit-status/%2Fapi%2Fhealth'
    );
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('/api/health');
    expect(res.body.state).toBe('closed');
  });
});

describe('auth protection', () => {
  it('rejects requests without a valid secret', async () => {
    const app = buildCircuitApp('s3cr3t');
    const res = await request(app).get('/circuit-status');
    expect(res.status).toBe(401);
  });

  it('allows requests with a valid secret', async () => {
    const app = buildCircuitApp('s3cr3t');
    const res = await request(app)
      .get('/circuit-status')
      .set('x-routewatch-secret', 's3cr3t');
    expect(res.status).toBe(200);
  });
});
