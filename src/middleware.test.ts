import express, { Express } from 'express';
import request from 'supertest';
import { routewatch } from './middleware';
import { SlowRouteAlert } from './types';

function buildApp(overrides: Parameters<typeof routewatch>[0] = {}): Express {
  const app = express();
  app.use(routewatch(overrides));

  app.get('/fast', (_req, res) => res.json({ ok: true }));

  app.get('/slow', (_req, res) => {
    setTimeout(() => res.json({ ok: true }), 80);
  });

  return app;
}

describe('routewatch middleware', () => {
  it('does not trigger onAlert for fast routes', async () => {
    const onAlert = jest.fn();
    const app = buildApp({ threshold: 500, onAlert });

    await request(app).get('/fast').expect(200);

    await new Promise((r) => setTimeout(r, 20));
    expect(onAlert).not.toHaveBeenCalled();
  });

  it('triggers onAlert when route exceeds threshold', async () => {
    const alerts: SlowRouteAlert[] = [];
    const app = buildApp({
      threshold: 50,
      onAlert: (alert) => alerts.push(alert),
    });

    await request(app).get('/slow').expect(200);

    await new Promise((r) => setTimeout(r, 20));
    expect(alerts).toHaveLength(1);
    expect(alerts[0].route).toBe('GET /slow');
    expect(alerts[0].durationMs).toBeGreaterThan(50);
    expect(alerts[0].threshold).toBe(50);
    expect(alerts[0].statusCode).toBe(200);
  });

  it('uses a custom logger', async () => {
    const warnSpy = jest.fn();
    const app = buildApp({
      threshold: 50,
      logger: { log: jest.fn(), warn: warnSpy },
    });

    await request(app).get('/slow').expect(200);
    await new Promise((r) => setTimeout(r, 20));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('SLOW ROUTE detected')
    );
  });

  it('logs all requests when logAll is true', async () => {
    const logSpy = jest.fn();
    const app = buildApp({
      logAll: true,
      logger: { log: logSpy, warn: jest.fn() },
    });

    await request(app).get('/fast').expect(200);
    await new Promise((r) => setTimeout(r, 20));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /fast')
    );
  });
});
