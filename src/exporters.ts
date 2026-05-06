import { getAllStats } from './metrics';
import { RouteStats } from './types';

export type ExportFormat = 'json' | 'csv' | 'prometheus';

export interface ExportOptions {
  format: ExportFormat;
  includeRoutes?: string[];
  excludeRoutes?: string[];
}

function filterStats(
  stats: Record<string, RouteStats>,
  options: ExportOptions
): Record<string, RouteStats> {
  const entries = Object.entries(stats);
  const filtered = entries.filter(([route]) => {
    if (options.includeRoutes && !options.includeRoutes.includes(route)) return false;
    if (options.excludeRoutes && options.excludeRoutes.includes(route)) return false;
    return true;
  });
  return Object.fromEntries(filtered);
}

export function exportAsJson(options: ExportOptions): string {
  const stats = filterStats(getAllStats(), options);
  return JSON.stringify(stats, null, 2);
}

export function exportAsCsv(options: ExportOptions): string {
  const stats = filterStats(getAllStats(), options);
  const header = 'route,count,totalMs,avgMs,minMs,maxMs';
  const rows = Object.entries(stats).map(([route, s]) => {
    const avg = s.count > 0 ? (s.totalMs / s.count).toFixed(2) : '0';
    return `${route},${s.count},${s.totalMs},${avg},${s.minMs},${s.maxMs}`;
  });
  return [header, ...rows].join('\n');
}

export function exportAsPrometheus(options: ExportOptions): string {
  const stats = filterStats(getAllStats(), options);
  const lines: string[] = [];
  for (const [route, s] of Object.entries(stats)) {
    const label = `route="${route}"`;
    lines.push(`routewatch_requests_total{${label}} ${s.count}`);
    lines.push(`routewatch_duration_ms_total{${label}} ${s.totalMs}`);
    lines.push(`routewatch_duration_ms_min{${label}} ${s.minMs}`);
    lines.push(`routewatch_duration_ms_max{${label}} ${s.maxMs}`);
  }
  return lines.join('\n');
}

export function exportStats(options: ExportOptions): string {
  switch (options.format) {
    case 'json': return exportAsJson(options);
    case 'csv': return exportAsCsv(options);
    case 'prometheus': return exportAsPrometheus(options);
    default: throw new Error(`Unsupported export format: ${options.format}`);
  }
}
