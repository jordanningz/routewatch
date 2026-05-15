import express, { Express } from 'express';
import request from 'supertest';
import { createRetryPolicyRouter } from './retryPolicyRouter';
import { resetRetryPolicies } from './routeRetryPolicy';

function buildRetryPolicyApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/retry-policies', createRetryPolicyRouter());
  return app;
}

beforeEach(() => {
  resetRetryPolicies();
});

describe('GET /retry-policies', () => {
  it('returns empty object when no policies set', async () => {
    const res = await request(buildRetryPolicyApp()).get('/retry-policies');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns all stored policies', async () => {
    const app = buildRetryPolicyApp();
    await request(app)
      .put('/retry-policies/GET%20%2Fapi%2Fitems')
      .send({ maxRetries: 2 });
    const res = await request(app).get('/retry-policies');
    expect(res.status).toBe(200);
    expect(res.body['GET /api/items']).toBeDefined();
  });
});

describe('GET /retry-policies/:route', () => {
  it('returns policy for known route', async () => {
    const app = buildRetryPolicyApp();
    await request(app)
      .put('/retry-policies/GET%20%2Fapi%2Fusers')
      .send({ maxRetries: 4, backoffMs: 200 });
    const res = await request(app).get('/retry-policies/GET%20%2Fapi%2Fusers');
    expect(res.status).toBe(200);
    expect(res.body.maxRetries).toBe(4);
    expect(res.body.backoffMs).toBe(200);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(buildRetryPolicyApp()).get('/retry-policies/GET%20%2Funknown');
    expect(res.status).toBe(404);
  });
});

describe('PUT /retry-policies/:route', () => {
  it('creates a new retry policy', async () => {
    const res = await request(buildRetryPolicyApp())
      .put('/retry-policies/POST%20%2Fsubmit')
      .send({ maxRetries: 5, retryOn: [500, 503] });
    expect(res.status).toBe(200);
    expect(res.body.maxRetries).toBe(5);
    expect(res.body.retryOn).toContain(500);
  });

  it('applies defaults for missing fields', async () => {
    const res = await request(buildRetryPolicyApp())
      .put('/retry-policies/GET%20%2Fdefaults')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.maxRetries).toBe(3);
    expect(res.body.backoffMs).toBe(100);
  });
});

describe('DELETE /retry-policies/:route', () => {
  it('removes an existing policy', async () => {
    const app = buildRetryPolicyApp();
    await request(app).put('/retry-policies/GET%20%2Fdelete-me').send({});
    const res = await request(app).delete('/retry-policies/GET%20%2Fdelete-me');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch('GET /delete-me');
  });

  it('returns 404 when policy does not exist', async () => {
    const res = await request(buildRetryPolicyApp()).delete('/retry-policies/GET%20%2Fgone');
    expect(res.status).toBe(404);
  });
});
