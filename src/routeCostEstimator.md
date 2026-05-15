# routeCostEstimator

Assign and query computational cost estimates for individual API routes. Useful for capacity planning, request prioritization, and identifying resource-intensive endpoints.

## Concepts

Each route can be assigned three weights (1–10):

| Weight | Meaning |
|---|---|
| `cpuWeight` | Relative CPU usage |
| `memoryWeight` | Relative memory allocation |
| `ioWeight` | Relative I/O (DB, network) cost |

A `label` (`low` | `medium` | `high` | `critical`) is automatically derived from the average of the three weights.

## API

### `setCostEstimate(route, cpu, memory, io, notes?)`

Stores a cost estimate for a route. Throws `RangeError` if any weight is outside `[1, 10]`.

```ts
setCostEstimate('POST /export', 9, 7, 8, 'heavy CSV generation');
```

### `getCostEstimate(route)`

Returns the stored `RouteCostEstimate` or `undefined`.

### `removeCostEstimate(route)`

Deletes the estimate for a route. Returns `true` if found and removed.

### `getAllCostEstimates()`

Returns all stored estimates as an array.

### `getRoutesByCostLabel(label)`

Filters estimates by cost label.

```ts
const criticalRoutes = getRoutesByCostLabel('critical');
```

### `computeTotalCostScore(route)`

Returns the sum of all three weights for a route, or `undefined` if not found.

### `resetCostEstimates()`

Clears all stored estimates. Primarily intended for testing.

## Label Thresholds

| Average Weight | Label |
|---|---|
| ≤ 2.5 | `low` |
| ≤ 5.0 | `medium` |
| ≤ 7.5 | `high` |
| > 7.5 | `critical` |
