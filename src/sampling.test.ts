import {
  configureSampling,
  getSampleRate,
  shouldSample,
  resetSamplingConfig,
  getCurrentSamplingConfig,
} from './sampling';

beforeEach(() => {
  resetSamplingConfig();
});

describe('getSampleRate', () => {
  it('returns 1.0 by default', () => {
    expect(getSampleRate('/api/users')).toBe(1.0);
  });

  it('returns global rate when configured', () => {
    configureSampling({ rate: 0.5 });
    expect(getSampleRate('/api/users')).toBe(0.5);
  });

  it('returns per-route rate when configured', () => {
    configureSampling({ rate: 0.5, perRoute: { '/api/health': 0.1 } });
    expect(getSampleRate('/api/health')).toBe(0.1);
    expect(getSampleRate('/api/users')).toBe(0.5);
  });

  it('clamps rates to [0, 1]', () => {
    configureSampling({ rate: 1.5 });
    expect(getSampleRate('/any')).toBe(1.0);
    configureSampling({ rate: -0.5 });
    expect(getSampleRate('/any')).toBe(0.0);
  });
});

describe('shouldSample', () => {
  it('always samples when rate is 1.0', () => {
    for (let i = 0; i < 20; i++) {
      expect(shouldSample('/api/test')).toBe(true);
    }
  });

  it('never samples when rate is 0.0', () => {
    configureSampling({ rate: 0 });
    for (let i = 0; i < 20; i++) {
      expect(shouldSample('/api/test')).toBe(false);
    }
  });

  it('samples approximately correct proportion at 0.5', () => {
    configureSampling({ rate: 0.5 });
    const results = Array.from({ length: 1000 }, () => shouldSample('/api/test'));
    const trueCount = results.filter(Boolean).length;
    expect(trueCount).toBeGreaterThan(400);
    expect(trueCount).toBeLessThan(600);
  });
});

describe('getCurrentSamplingConfig', () => {
  it('returns a copy of the current config', () => {
    configureSampling({ rate: 0.8, perRoute: { '/api/slow': 0.2 } });
    const config = getCurrentSamplingConfig();
    expect(config.rate).toBe(0.8);
    expect(config.perRoute['/api/slow']).toBe(0.2);
  });
});
