# Retention Policy

The `retentionPolicy` module automatically evicts stale route metrics so that
long-running servers don't accumulate unbounded in-memory data.

## Configuration

```ts
import { configureRetentionPolicy } from './retentionPolicy';

configureRetentionPolicy({
  maxAgeMs: 6 * 60 * 60 * 1000, // evict entries not seen in 6 hours
  maxEntries: 200,              // keep at most 200 routes
  sweepIntervalMs: 30 * 1000,   // sweep every 30 seconds
});
```

| Option | Default | Description |
|---|---|---|
| `maxAgeMs` | `86_400_000` (24 h) | Max milliseconds since a route was last seen before eviction |
| `maxEntries` | `500` | Hard cap on the number of retained route entries |
| `sweepIntervalMs` | `60_000` (1 min) | How often the background sweep runs |

## Integration with middleware

Call `touchRoute(route)` inside your `routewatch` middleware whenever a request
is processed so the retention policy can track recency:

```ts
import { touchRoute } from './retentionPolicy';

// inside routewatch middleware, after recordMetric:
touchRoute(`${req.method} ${req.route?.path ?? req.path}`);
```

## Starting / stopping the background sweep

```ts
import { startRetentionSweep, stopRetentionSweep } from './retentionPolicy';

// On server start:
startRetentionSweep();

// On graceful shutdown:
stopRetentionSweep();
```

## Manual eviction

```ts
import { runEviction } from './retentionPolicy';

const evictedRoutes = runEviction();
console.log('Evicted:', evictedRoutes);
```
