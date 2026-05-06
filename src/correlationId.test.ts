import express, { Request, Response } from 'express';
import request from 'supertest';
import {
  correlationIdMiddleware,
  configureCorrelationId,
  resetCorrelationIdConfig,
  getCorrelationIdConfig,
  getCorrelationId,
} from './correlationId';

function buildApp() {
  const app = express();
  app.use(correlationIdMiddleware);
  app.get('/test', (req: Request, res: Response) => {
    res.json({ correlationId: getCorrelationId(req) });
  });
  return app;
}

afterEach(() => {
  resetCorrelationIdConfig();
});

describe('correlationIdMiddleware', () => {
  it('generates a correlation id when none is provided', async () => {
    const res = await request(buildApp()).get('/test');
    expect(res.body.correlationId).toBeDefined();
    expect(typeof res.body.correlationId).toBe('string');
  });

  it('uses the existing correlation id from the request header', async () => {
    const res = await request(buildApp())
      .get('/test')
      .set('x-correlation-id', 'my-id-123');
    expect(res.body.correlationId).toBe('my-id-123');
  });

  it('propagates the correlation id in the response header', async () => {
    const res = await request(buildApp()).get('/test');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('does not propagate when propagate is false', async () => {
    configureCorrelationId({ propagate: false });
    const res = await request(buildApp()).get('/test');
    expect(res.headers['x-correlation-id']).toBeUndefined();
  });

  it('uses a custom header name when configured', async () => {
    configureCorrelationId({ header: 'x-request-id' });
    const res = await request(buildApp())
      .get('/test')
      .set('x-request-id', 'custom-id');
    expect(res.body.correlationId).toBe('custom-id');
    expect(res.headers['x-request-id']).toBe('custom-id');
  });

  it('uses a custom id generator when configured', async () => {
    configureCorrelationId({ generateId: () => 'fixed-id' });
    const res = await request(buildApp()).get('/test');
    expect(res.body.correlationId).toBe('fixed-id');
  });
});

describe('getCorrelationIdConfig', () => {
  it('returns the default config', () => {
    const cfg = getCorrelationIdConfig();
    expect(cfg.header).toBe('x-correlation-id');
    expect(cfg.propagate).toBe(true);
    expect(typeof cfg.generateId).toBe('function');
  });

  it('reflects updated config', () => {
    configureCorrelationId({ header: 'x-trace-id', propagate: false });
    const cfg = getCorrelationIdConfig();
    expect(cfg.header).toBe('x-trace-id');
    expect(cfg.propagate).toBe(false);
  });
});
