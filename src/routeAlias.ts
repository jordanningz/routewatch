/**
 * routeAlias.ts
 * Allows mapping raw Express route paths to human-readable alias names.
 * Useful for grouping parameterised routes under a canonical label.
 */

type AliasMap = Map<string, string>;

const aliasMap: AliasMap = new Map();

/**
 * Register an alias for a route pattern.
 * e.g. aliasRoute('/users/:id', 'Get User')
 */
export function aliasRoute(pattern: string, alias: string): void {
  if (!pattern || !alias) {
    throw new Error('Both pattern and alias must be non-empty strings.');
  }
  aliasMap.set(pattern, alias);
}

/**
 * Retrieve the alias for a given route pattern.
 * Returns the pattern itself if no alias is registered.
 */
export function getAlias(pattern: string): string {
  return aliasMap.get(pattern) ?? pattern;
}

/**
 * Remove the alias for a given route pattern.
 */
export function removeAlias(pattern: string): void {
  aliasMap.delete(pattern);
}

/**
 * Return all registered aliases as a plain object.
 */
export function getAllAliases(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [pattern, alias] of aliasMap.entries()) {
    result[pattern] = alias;
  }
  return result;
}

/**
 * Find the route pattern registered under a given alias.
 * Returns undefined if the alias is not found.
 */
export function findPatternByAlias(alias: string): string | undefined {
  for (const [pattern, a] of aliasMap.entries()) {
    if (a === alias) return pattern;
  }
  return undefined;
}

/**
 * Clear all registered aliases. Useful for test teardown.
 */
export function resetAliases(): void {
  aliasMap.clear();
}
