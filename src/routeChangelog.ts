/**
 * routeChangelog.ts
 * Track a history of changes made to route configurations over time.
 */

export interface ChangelogEntry {
  timestamp: number;
  author: string;
  description: string;
  metadata?: Record<string, unknown>;
}

const changelog: Map<string, ChangelogEntry[]> = new Map();

export function logChange(
  route: string,
  author: string,
  description: string,
  metadata?: Record<string, unknown>
): ChangelogEntry {
  const entry: ChangelogEntry = {
    timestamp: Date.now(),
    author,
    description,
    ...(metadata ? { metadata } : {}),
  };

  const existing = changelog.get(route) ?? [];
  changelog.set(route, [...existing, entry]);
  return entry;
}

export function getChangelog(route: string): ChangelogEntry[] {
  return changelog.get(route) ?? [];
}

export function getLatestChange(route: string): ChangelogEntry | undefined {
  const entries = changelog.get(route);
  if (!entries || entries.length === 0) return undefined;
  return entries[entries.length - 1];
}

export function getChangelogByAuthor(
  author: string
): Record<string, ChangelogEntry[]> {
  const result: Record<string, ChangelogEntry[]> = {};
  for (const [route, entries] of changelog.entries()) {
    const filtered = entries.filter((e) => e.author === author);
    if (filtered.length > 0) result[route] = filtered;
  }
  return result;
}

export function getAllChangelogs(): Record<string, ChangelogEntry[]> {
  const result: Record<string, ChangelogEntry[]> = {};
  for (const [route, entries] of changelog.entries()) {
    result[route] = entries;
  }
  return result;
}

export function clearChangelog(route: string): void {
  changelog.delete(route);
}

export function resetChangelogs(): void {
  changelog.clear();
}
