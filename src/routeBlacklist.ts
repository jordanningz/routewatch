/**
 * routeBlacklist.ts
 * Allows certain routes to be excluded from logging, metrics, and alerting.
 */

let blacklistedPatterns: RegExp[] = [];
let blacklistedExact: Set<string> = new Set();

export function blacklistRoute(pattern: string | RegExp): void {
  if (typeof pattern === "string") {
    blacklistedExact.add(pattern);
  } else {
    blacklistedPatterns.push(pattern);
  }
}

export function removeFromBlacklist(pattern: string | RegExp): void {
  if (typeof pattern === "string") {
    blacklistedExact.delete(pattern);
  } else {
    blacklistedPatterns = blacklistedPatterns.filter(
      (p) => p.source !== pattern.source || p.flags !== pattern.flags
    );
  }
}

export function isBlacklisted(route: string): boolean {
  if (blacklistedExact.has(route)) return true;
  return blacklistedPatterns.some((pattern) => pattern.test(route));
}

export function getBlacklist(): { exact: string[]; patterns: RegExp[] } {
  return {
    exact: Array.from(blacklistedExact),
    patterns: [...blacklistedPatterns],
  };
}

export function resetBlacklist(): void {
  blacklistedExact.clear();
  blacklistedPatterns = [];
}
