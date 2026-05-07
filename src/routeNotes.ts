/**
 * routeNotes.ts
 * Attach arbitrary developer notes/annotations to routes for documentation purposes.
 */

type RouteNoteEntry = {
  note: string;
  author?: string;
  createdAt: number;
};

const routeNotes: Map<string, RouteNoteEntry[]> = new Map();

/**
 * Add a note to a route pattern.
 */
export function addNote(
  routePattern: string,
  note: string,
  author?: string
): void {
  if (!routePattern || !note) {
    throw new Error("routePattern and note are required");
  }
  const existing = routeNotes.get(routePattern) ?? [];
  existing.push({ note, author, createdAt: Date.now() });
  routeNotes.set(routePattern, existing);
}

/**
 * Retrieve all notes for a route pattern.
 */
export function getNotes(routePattern: string): RouteNoteEntry[] {
  return routeNotes.get(routePattern) ?? [];
}

/**
 * Remove all notes for a route pattern.
 */
export function clearNotes(routePattern: string): void {
  routeNotes.delete(routePattern);
}

/**
 * Get a map of all routes that have notes.
 */
export function getAllNotes(): Record<string, RouteNoteEntry[]> {
  const result: Record<string, RouteNoteEntry[]> = {};
  for (const [route, notes] of routeNotes.entries()) {
    result[route] = notes;
  }
  return result;
}

/**
 * Get routes that have notes from a specific author.
 */
export function getNotesByAuthor(
  author: string
): Record<string, RouteNoteEntry[]> {
  const result: Record<string, RouteNoteEntry[]> = {};
  for (const [route, notes] of routeNotes.entries()) {
    const filtered = notes.filter((n) => n.author === author);
    if (filtered.length > 0) {
      result[route] = filtered;
    }
  }
  return result;
}

/**
 * Reset all route notes (useful for testing).
 */
export function resetRouteNotes(): void {
  routeNotes.clear();
}
