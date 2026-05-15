/**
 * routeMetadata.ts
 * Attach arbitrary key-value metadata to routes for documentation,
 * tooling, and runtime inspection purposes.
 */

export interface RouteMetadataEntry {
  [key: string]: unknown;
}

const metadataStore = new Map<string, RouteMetadataEntry>();

/** Set (merge) metadata for a route pattern. */
export function setMetadata(
  pattern: string,
  data: RouteMetadataEntry
): void {
  const existing = metadataStore.get(pattern) ?? {};
  metadataStore.set(pattern, { ...existing, ...data });
}

/** Retrieve all metadata for a route pattern. */
export function getMetadata(
  pattern: string
): RouteMetadataEntry | undefined {
  return metadataStore.get(pattern);
}

/** Remove a specific key from a route's metadata. */
export function removeMetadataKey(
  pattern: string,
  key: string
): void {
  const entry = metadataStore.get(pattern);
  if (!entry) return;
  delete entry[key];
  if (Object.keys(entry).length === 0) {
    metadataStore.delete(pattern);
  } else {
    metadataStore.set(pattern, entry);
  }
}

/** Delete all metadata for a route pattern. */
export function clearMetadata(pattern: string): void {
  metadataStore.delete(pattern);
}

/** Return all patterns that have metadata, with their entries. */
export function getAllMetadata(): Record<string, RouteMetadataEntry> {
  const result: Record<string, RouteMetadataEntry> = {};
  for (const [pattern, entry] of metadataStore.entries()) {
    result[pattern] = { ...entry };
  }
  return result;
}

/** Find all route patterns that contain a given metadata key. */
export function getRoutesByMetadataKey(
  key: string
): string[] {
  const routes: string[] = [];
  for (const [pattern, entry] of metadataStore.entries()) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) {
      routes.push(pattern);
    }
  }
  return routes;
}

/** Reset the entire metadata store (useful for testing). */
export function resetMetadata(): void {
  metadataStore.clear();
}
