import express, { Express } from 'express';
import request from 'supertest';
import { createDeprecationMiddleware } from './deprecationMiddleware';
import { deprecateRoute, resetDeprecations } from './routeDeprecation';

function buildApp(options = {}): Express {
  const app = express();
  app.use(createDeprecationMiddleware(options));
  app.get('/api/v1/users', (_req, res) => res.json({ ok: true }));
  app.get('/api/v2/users', (_req, res) => res.json({ ok: true }));
  app.get('/gone', (_req, res) => res.json({ ok: true }));
  return app;
}

beforeEach(() => {
  resetDeprecations();
});

describe('createDeprecationMiddleware', () => {
  it('passes through non-deprecated routes without headers', async () => {
    const res = await request(buildApp()).get('/api/v2/users');
    expect(res.status).toBe(200);
    expect(res.headers['deprecation']).toBeUndefined();
  });

  it('adds Deprecation header for deprecated routes', async () => {
    deprecateRoute('/api/v1/users', 'Use v2 instead', { replacement: '/api/v2/users' });
    const res = await request(buildApp()).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.headers['deprecation']).toContain('Use v2 instead');
  });

  it('adds Link header when replacement is set', async () => {
    deprecateRoute('/api/v1/users', 'Use v2', { replacement: '/api/v2/users' });
    const res = await request(buildApp()).get('/api/v1/users');
    expect(res.headers['link']).toContain('/api/v2/users');
    expect(res.headers['link']).toContain('successor-version');
  });

  it('uses custom header name when configured', async () => {
    deprecateRoute('/api/v1/users', 'Old');
    const res = await request(buildApp({ headerName: 'X-Deprecated' })).get('/api/v1/users');
    expect(res.headers['x-deprecated']).toContain('Old');
  });

  it('returns 410 Gone for sunset routes when blockSunset is true', async () => {
    deprecateRoute('/gone', 'This is gone', {
      sunset: '2000-01-01T00:00:00.000Z',
      replacement: '/new',
    });
    const res = await request(buildApp({ blockSunset: true })).get('/gone');
    expect(res.status).toBe(410);
    expect(res.body.error).toBe('Gone');
    expect(res.body.replacement).toBe('/new');
  });

  it('does not block sunset routes when blockSunset is false', async () => {
    deprecateRoute('/gone', 'This is gone', { sunset: '2000-01-01T00:00:00.000Z' });
    const res = await request(buildApp({ blockSunset: false })).get('/gone');
    expect(res.status).toBe(200);
  });
});
