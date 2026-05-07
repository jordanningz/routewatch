import { getAllAliases } from './routeAlias';

export interface DeprecationEntry {
  pattern: string;
  message: string;
  sunset?: string; // ISO date string
  replacement?: string;
  deprecatedAt: string;
}

const deprecations = new Map<string, DeprecationEntry>();

export function deprecateRoute(
  pattern: string,
  message: string,
  options: { sunset?: string; replacement?: string } = {}
): void {
  deprecations.set(pattern, {
    pattern,
    message,
    sunset: options.sunset,
    replacement: options.replacement,
    deprecatedAt: new Date().toISOString(),
  });
}

export function removeDeprecation(pattern: string): boolean {
  return deprecations.delete(pattern);
}

export function getDeprecation(pattern: string): DeprecationEntry | undefined {
  return deprecations.get(pattern);
}

export function getAllDeprecations(): DeprecationEntry[] {
  return Array.from(deprecations.values());
}

export function isDeprecated(pattern: string): boolean {
  return deprecations.has(pattern);
}

export function isSunset(pattern: string): boolean {
  const entry = deprecations.get(pattern);
  if (!entry || !entry.sunset) return false;
  return new Date(entry.sunset) <= new Date();
}

export function resetDeprecations(): void {
  deprecations.clear();
}

export function buildDeprecationHeader(entry: DeprecationEntry): string {
  const parts: string[] = [`Deprecated: ${entry.message}`];
  if (entry.sunset) parts.push(`Sunset: ${entry.sunset}`);
  if (entry.replacement) parts.push(`Use: ${entry.replacement}`);
  return parts.join('; ');
}
