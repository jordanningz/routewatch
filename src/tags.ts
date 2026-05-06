/**
 * Route tagging: attach custom metadata tags to routes for filtering/grouping in metrics and alerts.
 */

type TagMap = Map<string, string[]>;

const routeTags: TagMap = new Map();

/**
 * Register one or more tags for a given route pattern.
 * Tags are additive — calling this multiple times merges tags.
 */
export function tagRoute(route: string, tags: string[]): void {
  const existing = routeTags.get(route) ?? [];
  const merged = Array.from(new Set([...existing, ...tags]));
  routeTags.set(route, merged);
}

/**
 * Retrieve all tags associated with a route pattern.
 * Returns an empty array if the route has no tags.
 */
export function getTagsForRoute(route: string): string[] {
  return routeTags.get(route) ?? [];
}

/**
 * Returns all routes that have been assigned the given tag.
 */
export function getRoutesByTag(tag: string): string[] {
  const matches: string[] = [];
  for (const [route, tags] of routeTags.entries()) {
    if (tags.includes(tag)) {
      matches.push(route);
    }
  }
  return matches;
}

/**
 * Remove all tags from a specific route.
 */
export function clearTagsForRoute(route: string): void {
  routeTags.delete(route);
}

/**
 * Remove all tag registrations (useful for test teardown).
 */
export function resetTags(): void {
  routeTags.clear();
}

/**
 * Return a snapshot of all route→tags mappings.
 */
export function getAllTags(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [route, tags] of routeTags.entries()) {
    result[route] = [...tags];
  }
  return result;
}
