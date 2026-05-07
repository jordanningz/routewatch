# routeHealth

Provides per-route health assessment by aggregating signals from metrics, circuit breakers, deprecation state, and the route blacklist.

## Usage

```ts
import { configureRouteHealth, assessRouteHealth, assessAllRoutes } from './routeHealth';

configureRouteHealth({
  errorRateThreshold: 0.05,   // flag if >5% of requests error
  slowRateThreshold: 0.20,    // flag if >20% of requests are slow
  minRequestsForEval: 10,     // need at least 10 requests before evaluating
});

const report = assessRouteHealth('GET /api/users');
console.log(report.status);  // 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
console.log(report.reasons); // ["High error rate: 12.5%"]

const all = assessAllRoutes();
```

## Health Statuses

| Status | Meaning |
|---|---|
| `healthy` | No issues detected |
| `degraded` | Minor issues (slow requests, deprecated, circuit half-open) |
| `unhealthy` | Critical issues (high error rate, open circuit, blacklisted) |
| `unknown` | Not enough data to evaluate |

## Configuration

| Option | Default | Description |
|---|---|---|
| `errorRateThreshold` | `0.1` | Fraction of requests that must error to mark unhealthy |
| `slowRateThreshold` | `0.25` | Fraction of requests that must be slow to mark degraded |
| `minRequestsForEval` | `5` | Minimum request count before health is evaluated |

## API

- `configureRouteHealth(options)` — update health thresholds
- `getRouteHealthConfig()` — read current config
- `resetRouteHealthConfig()` — restore defaults
- `assessRouteHealth(route)` — evaluate a single route
- `assessAllRoutes()` — evaluate every tracked route
