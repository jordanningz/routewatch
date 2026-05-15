/**
 * routeTrafficProfile.ts
 * Track and query traffic patterns (peak hour, request volume tiers) per route.
 */

export type TrafficTier = 'low' | 'medium' | 'high' | 'critical';

export interface TrafficProfile {
  route: string;
  totalRequests: number;
  peakHour: number | null; // 0-23
  tier: TrafficTier;
  lastUpdated: number;
}

const profiles = new Map<string, TrafficProfile>();
const hourlyBuckets = new Map<string, number[]>(); // route -> 24-slot array

function getTierForCount(total: number): TrafficTier {
  if (total < 100) return 'low';
  if (total < 1000) return 'medium';
  if (total < 10000) return 'high';
  return 'critical';
}

export function recordTrafficHit(route: string): void {
  const now = new Date();
  const hour = now.getHours();

  if (!hourlyBuckets.has(route)) {
    hourlyBuckets.set(route, new Array(24).fill(0));
  }
  const buckets = hourlyBuckets.get(route)!;
  buckets[hour] += 1;

  const existing = profiles.get(route);
  const totalRequests = (existing?.totalRequests ?? 0) + 1;
  const peakHour = buckets.indexOf(Math.max(...buckets));

  profiles.set(route, {
    route,
    totalRequests,
    peakHour,
    tier: getTierForCount(totalRequests),
    lastUpdated: Date.now(),
  });
}

export function getTrafficProfile(route: string): TrafficProfile | undefined {
  return profiles.get(route);
}

export function getAllTrafficProfiles(): TrafficProfile[] {
  return Array.from(profiles.values());
}

export function getRoutesByTier(tier: TrafficTier): TrafficProfile[] {
  return getAllTrafficProfiles().filter((p) => p.tier === tier);
}

export function getHourlyBuckets(route: string): number[] | undefined {
  return hourlyBuckets.get(route);
}

/**
 * Returns the top N routes by total request count, sorted descending.
 * Useful for identifying the most heavily trafficked routes at a glance.
 */
export function getTopRoutesByVolume(limit: number): TrafficProfile[] {
  return getAllTrafficProfiles()
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, limit);
}

export function resetTrafficProfiles(): void {
  profiles.clear();
  hourlyBuckets.clear();
}
