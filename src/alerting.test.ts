import {
  defaultAlertHandler,
  createAlert,
  isSlowRoute,
  composeAlertHandlers,
} from './alerting';
import { RouteWatchAlert } from './types';

describe('createAlert', () => {
  it('should create an alert with normalized method and correct fields', () => {
    const alert = createAlert('get', '/api/users', 750, 500);
    expect(alert.method).toBe('GET');
    expect(alert.path).toBe('/api/users');
    expect(alert.duration).toBe(750);
    expect(alert.threshold).toBe(500);
    expect(typeof alert.timestamp).toBe('number');
  });

  it('should set timestamp close to Date.now()', () => {
    const before = Date.now();
    const alert = createAlert('POST', '/api/data', 300, 200);
    const after = Date.now();
    expect(alert.timestamp).toBeGreaterThanOrEqual(before);
    expect(alert.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('isSlowRoute', () => {
  it('should return true when duration exceeds threshold', () => {
    expect(isSlowRoute(600, 500)).toBe(true);
  });

  it('should return false when duration equals threshold', () => {
    expect(isSlowRoute(500, 500)).toBe(false);
  });

  it('should return false when duration is below threshold', () => {
    expect(isSlowRoute(200, 500)).toBe(false);
  });
});

describe('defaultAlertHandler', () => {
  it('should log a warning to stderr without throwing', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const alert: RouteWatchAlert = createAlert('GET', '/slow', 1200, 500);
    expect(() => defaultAlertHandler(alert)).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('SLOW ROUTE DETECTED');
    spy.mockRestore();
  });
});

describe('composeAlertHandlers', () => {
  it('should call all handlers with the alert', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    const composed = composeAlertHandlers(h1, h2);
    const alert = createAlert('DELETE', '/api/item/1', 800, 500);
    composed(alert);
    expect(h1).toHaveBeenCalledWith(alert);
    expect(h2).toHaveBeenCalledWith(alert);
  });

  it('should continue calling remaining handlers if one throws', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const throwing = jest.fn(() => { throw new Error('handler error'); });
    const safe = jest.fn();
    const composed = composeAlertHandlers(throwing, safe);
    const alert = createAlert('PUT', '/api/update', 900, 500);
    expect(() => composed(alert)).not.toThrow();
    expect(safe).toHaveBeenCalledWith(alert);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
