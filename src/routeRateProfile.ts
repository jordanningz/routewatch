/**
 * routeRateProfile.ts
 * Tracks request rate profiles per route: requests per minute, peak rate, and rate tier.
 */

export type RateTier = 'idle' | 'low' | 'medium' | 'high' | 'critical';

export interface RateProfile {
  route: string;
  totalRequests: number;
  windowStart: number;
  requestsInWindow: number;
  peakRatePerMinute: number;
  currentRatePerMinute: number;
  tier: RateTier;
}

const WINDOW_MS = 60_000;

const profiles = new Map<string, RateProfile>();

export function getTierForRate(rpm: number): RateTier {
  if (rpm === 0) return 'idle';
  if (rpm < 10) return 'low';
  if (rpm < 100) return 'medium';
  if (rpm < 500) return 'high';
  return 'critical';
}

export function recordRateHit(route: string): RateProfile {
  const now = Date.now();
  let profile = profiles.get(route);

  if (!profile) {
    profile = {
      route,
      totalRequests: 0,
      windowStart: now,
      requestsInWindow: 0,
      peakRatePerMinute: 0,
      currentRatePerMinute: 0,
      tier: 'idle',
    };
    profiles.set(route, profile);
  }

  const elapsed = now - profile.windowStart;
  if (elapsed >= WINDOW_MS) {
    const rpm = Math.round((profile.requestsInWindow / elapsed) * WINDOW_MS);
    profile.peakRatePerMinute = Math.max(profile.peakRatePerMinute, rpm);
    profile.windowStart = now;
    profile.requestsInWindow = 0;
  }

  profile.totalRequests += 1;
  profile.requestsInWindow += 1;

  const windowElapsed = Math.max(now - profile.windowStart, 1);
  profile.currentRatePerMinute = Math.round(
    (profile.requestsInWindow / windowElapsed) * WINDOW_MS
  );
  profile.tier = getTierForRate(profile.currentRatePerMinute);

  return { ...profile };
}

export function getRateProfile(route: string): RateProfile | undefined {
  const p = profiles.get(route);
  return p ? { ...p } : undefined;
}

export function getAllRateProfiles(): RateProfile[] {
  return Array.from(profiles.values()).map((p) => ({ ...p }));
}

export function getRoutesByRateTier(tier: RateTier): string[] {
  return Array.from(profiles.values())
    .filter((p) => p.tier === tier)
    .map((p) => p.route);
}

export function resetRateProfiles(): void {
  profiles.clear();
}
