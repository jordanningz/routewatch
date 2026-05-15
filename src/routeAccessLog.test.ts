import {
  appendAccessLog,
  getAccessLog,
  getAccessLogByStatus,
  getAccessLogSummary,
  configureAccessLog,
  getAccessLogConfig,
  resetAccessLog,
  AccessLogEntry,
} from './routeAccessLog';

function makeEntry(overrides: Partial<AccessLogEntry> = {}): AccessLogEntry {
  return {
    route: '/api/users',
    method: 'GET',
    timestamp: Date.now(),
    durationMs: 120,
    statusCode: 200,
    ...overrides,
  };
}

beforeEach(() => {
  resetAccessLog();
});

describe('configureAccessLog', () => {
  it('updates config and returns it', () => {
    configureAccessLog({ maxEntries: 50 });
    expect(getAccessLogConfig().maxEntries).toBe(50);
  });

  it('uses defaults for unspecified fields', () => {
    configureAccessLog({ maxEntries: 10 });
    expect(getAccessLogConfig().ttlMs).toBe(60 * 60 * 1000);
  });
});

describe('appendAccessLog', () => {
  it('stores an entry', () => {
    appendAccessLog(makeEntry());
    expect(getAccessLog()).toHaveLength(1);
  });

  it('respects maxEntries by trimming oldest', () => {
    configureAccessLog({ maxEntries: 3 });
    for (let i = 0; i < 5; i++) {
      appendAccessLog(makeEntry({ durationMs: i * 10 }));
    }
    const log = getAccessLog();
    expect(log).toHaveLength(3);
    expect(log[0].durationMs).toBe(20);
  });

  it('evicts entries older than ttlMs', () => {
    configureAccessLog({ ttlMs: 100 });
    appendAccessLog(makeEntry({ timestamp: Date.now() - 200 }));
    appendAccessLog(makeEntry({ timestamp: Date.now() }));
    expect(getAccessLog()).toHaveLength(1);
  });
});

describe('getAccessLog', () => {
  it('filters by route', () => {
    appendAccessLog(makeEntry({ route: '/api/users' }));
    appendAccessLog(makeEntry({ route: '/api/posts' }));
    expect(getAccessLog('/api/users')).toHaveLength(1);
  });
});

describe('getAccessLogByStatus', () => {
  it('returns only matching status codes', () => {
    appendAccessLog(makeEntry({ statusCode: 200 }));
    appendAccessLog(makeEntry({ statusCode: 500 }));
    expect(getAccessLogByStatus(500)).toHaveLength(1);
    expect(getAccessLogByStatus(200)).toHaveLength(1);
  });
});

describe('getAccessLogSummary', () => {
  it('aggregates count and avgDurationMs per route+method', () => {
    appendAccessLog(makeEntry({ durationMs: 100 }));
    appendAccessLog(makeEntry({ durationMs: 200 }));
    const summary = getAccessLogSummary();
    expect(summary['GET /api/users'].count).toBe(2);
    expect(summary['GET /api/users'].avgDurationMs).toBe(150);
  });
});
