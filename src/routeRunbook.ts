/**
 * routeRunbook.ts
 * Attach runbook URLs and operational notes to routes for incident response.
 */

export interface RunbookEntry {
  url: string;
  summary?: string;
  updatedAt: string;
  updatedBy?: string;
}

const runbookStore = new Map<string, RunbookEntry>();

export function setRunbook(
  pattern: string,
  url: string,
  options: { summary?: string; updatedBy?: string } = {}
): RunbookEntry {
  const entry: RunbookEntry = {
    url,
    summary: options.summary,
    updatedBy: options.updatedBy,
    updatedAt: new Date().toISOString(),
  };
  runbookStore.set(pattern, entry);
  return entry;
}

export function getRunbook(pattern: string): RunbookEntry | undefined {
  return runbookStore.get(pattern);
}

export function removeRunbook(pattern: string): boolean {
  return runbookStore.delete(pattern);
}

export function getAllRunbooks(): Record<string, RunbookEntry> {
  const result: Record<string, RunbookEntry> = {};
  for (const [pattern, entry] of runbookStore.entries()) {
    result[pattern] = entry;
  }
  return result;
}

export function hasRunbook(pattern: string): boolean {
  return runbookStore.has(pattern);
}

export function resetRunbooks(): void {
  runbookStore.clear();
}
