import express, { Application } from 'express';
import request from 'supertest';
import { routewatch } from './middleware';
import { clearMetrics, getRouteStats } from './metrics';
import { resetSamplingConfig } from './sampling';
import { AlertPayload } from './types';

export function buildApp(options = {}): Application {
  const app = express();
  app.use(routewatch(options));
  app.get('/fast', (_req, res) => res.json({ ok: true }));
  app.get('/slow', (_req, res) => {
    setTimeout(() => res.json({ ok: true }), 10);
  });
  return app;
}

beforeEach(() => {
  clearMetrics();
  resetSamplingConfig();
});

describe('routewatch middleware', () => {
  it('records a metric after a request completes', async () => {
    const app = buildApp();
    await request(app).get('/fast').expect(200);
    const stats = getRouteStats('/fast');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(1);
  });

  it('calls alert handler when route exceeds threshold', async () => {
    const alerts: AlertPayload[] = [];
    const app = buildApp({
      slowThreshold: 1,
      alertHandlers: [(p: AlertPayload) => alerts.push(p)],
    });
    await request(app).get('/slow').expect(200);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].route).toBe('/slow');
  });

  it('does not call alert handler for fast routes', async () => {
    const alerts: AlertPayload[] = [];
    const app = buildApp({
      slowThreshold: 10000,
      alertHandlers: [(p: AlertPayload) => alerts.push(p)],
    });
    await request(app).get('/fast').expect(200);
    expect(alerts.length).toBe(0);
  });

  it('respects sampling rate of 0 — records no metrics', async () => {
    const app = buildApp({ sampling: { rate: 0 } });
    await request(app).get('/fast').expect(200);
    const stats = getRouteStats('/fast');
    expect(stats).toBeNull();
  });

  it('respects sampling rate of 1 — always records metrics', async () => {
    const app = buildApp({ sampling: { rate: 1 } });
    for (let i = 0; i < 5; i++) {
      await request(app).get('/fast').expect(200);
    }
    const stats = getRouteStats('/fast');
    expect(stats!.count).toBe(5);
  });
});
