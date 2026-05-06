# Anomaly Detection

The `anomalyDetection` module identifies statistically unusual response latencies for a route using **z-score analysis**.

## How It Works

For each incoming latency value, the module:

1. Retrieves historical stats for the route via `getRouteStats`.
2. Computes the mean and standard deviation using `computePercentileStats`.
3. Calculates the z-score: `(latency - mean) / stdDev`.
4. Flags the request as an anomaly if `|z-score| > zScoreThreshold`.

## Configuration

```ts
import { configureAnomalyDetection } from './anomalyDetection';

configureAnomalyDetection({
  zScoreThreshold: 2.5,  // default: 3.0
  minSampleSize: 15,     // default: 10
  enabled: true,         // default: true
});
```

| Option             | Type    | Default | Description                                      |
|--------------------|---------|---------|--------------------------------------------------|
| `zScoreThreshold`  | number  | `3.0`   | Z-score above which a latency is an anomaly      |
| `minSampleSize`    | number  | `10`    | Minimum samples required before detection runs  |
| `enabled`          | boolean | `true`  | Toggle anomaly detection on/off                  |

## API

### `detectAnomaly(route, latency): AnomalyResult`

Analyses a single latency observation against historical data for the given route.

### `scanAllRoutesForAnomalies(latencyMap): AnomalyResult[]`

Accepts a `Record<string, number>` of route → latency pairs and returns anomaly results for all.

## Integration

Call `detectAnomaly` inside the `routewatch` middleware after recording a metric to trigger alerts on anomalous requests.
