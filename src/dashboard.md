# Dashboard Module

The `dashboard` module aggregates data from multiple routewatch subsystems into a unified snapshot for monitoring and observability.

## Overview

`buildDashboardSnapshot()` collects:
- Route-level metrics (count, avg/min/max duration)
- Percentile stats (p50, p95, p99)
- Circuit breaker state per route
- Anomaly detection flags
- Error rates

`getDashboardSummary()` provides a high-level overview including total routes, anomaly count, open circuits, and slow route counts.

## HTTP Endpoints (via `createDashboardRouter`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Full snapshot of all routes |
| GET | `/dashboard/summary` | Aggregated summary metrics |
| GET | `/dashboard/tag/:tag` | Routes filtered by tag |
| GET | `/dashboard/anomalies` | Routes currently flagged as anomalies |

## Authentication

All endpoints support optional API key protection via the `secret` parameter passed to `createDashboardRouter(secret)`.

Requests must include the `x-api-key` header matching the configured secret.

## Usage

```ts
import { createDashboardRouter } from './dashboardRouter';

app.use(createDashboardRouter(process.env.DASHBOARD_SECRET));
```

## Types

See `DashboardSnapshot` and `DashboardRouteEntry` in `src/types.ts`.
