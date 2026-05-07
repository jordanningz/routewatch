/**
 * Route Ownership — assign and query owners (team/individual) for routes.
 */

interface OwnershipEntry {
  owner: string;
  team?: string;
  assignedAt: number;
}

const ownershipMap = new Map<string, OwnershipEntry>();

/**
 * Assign an owner (and optional team) to a route pattern.
 */
export function assignOwner(
  pattern: string,
  owner: string,
  team?: string
): void {
  ownershipMap.set(pattern, { owner, team, assignedAt: Date.now() });
}

/**
 * Remove ownership entry for a route.
 */
export function removeOwner(pattern: string): boolean {
  return ownershipMap.delete(pattern);
}

/**
 * Get ownership info for a specific route pattern.
 */
export function getOwner(pattern: string): OwnershipEntry | undefined {
  return ownershipMap.get(pattern);
}

/**
 * Get all routes owned by a specific owner.
 */
export function getRoutesByOwner(owner: string): string[] {
  const routes: string[] = [];
  for (const [pattern, entry] of ownershipMap.entries()) {
    if (entry.owner === owner) routes.push(pattern);
  }
  return routes;
}

/**
 * Get all routes owned by a specific team.
 */
export function getRoutesByTeam(team: string): string[] {
  const routes: string[] = [];
  for (const [pattern, entry] of ownershipMap.entries()) {
    if (entry.team === team) routes.push(pattern);
  }
  return routes;
}

/**
 * Return all ownership entries as a plain object.
 */
export function getAllOwnership(): Record<string, OwnershipEntry> {
  const result: Record<string, OwnershipEntry> = {};
  for (const [pattern, entry] of ownershipMap.entries()) {
    result[pattern] = { ...entry };
  }
  return result;
}

/**
 * Clear all ownership data (useful for testing).
 */
export function resetOwnership(): void {
  ownershipMap.clear();
}
