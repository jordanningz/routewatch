# Exporters

The `exporters` module provides utilities to export collected route metrics in multiple formats for use with external monitoring tools, dashboards, or data pipelines.

## Supported Formats

| Format       | Description                                      |
|--------------|--------------------------------------------------|
| `json`       | Structured JSON object keyed by route            |
| `csv`        | Comma-separated values with a header row         |
| `prometheus` | Prometheus text exposition format                |

## Usage

```ts
import { exportStats } from './exporters';

// Export all routes as JSON
const json = exportStats({ format: 'json' });

// Export only specific routes as CSV
const csv = exportStats({
  format: 'csv',
  includeRoutes: ['/api/users', '/api/posts'],
});

// Export everything except health checks as Prometheus metrics
const prom = exportStats({
  format: 'prometheus',
  excludeRoutes: ['/health'],
});
```

## ExportOptions

| Option          | Type       | Description                              |
|-----------------|------------|------------------------------------------|
| `format`        | `ExportFormat` | Output format (`json`, `csv`, `prometheus`) |
| `includeRoutes` | `string[]` | Whitelist of routes to include           |
| `excludeRoutes` | `string[]` | Blacklist of routes to exclude           |

## Prometheus Metrics Exposed

- `routewatch_requests_total` — total request count per route
- `routewatch_duration_ms_total` — cumulative duration in ms
- `routewatch_duration_ms_min` — minimum observed duration
- `routewatch_duration_ms_max` — maximum observed duration
