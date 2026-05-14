# Route Priority

Assign priority levels to API routes to aid triage, alerting, and on-call workflows.

## Priority Levels

| Level      | Numeric Weight | Typical Use                          |
|------------|---------------|--------------------------------------|
| `critical` | 4             | Revenue or auth paths                |
| `high`     | 3             | Core product features                |
| `medium`   | 2             | Default for unregistered routes      |
| `low`      | 1             | Background jobs, analytics endpoints |

## API

### `setRoutePriority(pattern, priority, reason?)`
Assigns a priority level to a route pattern. Optionally include a human-readable reason.

### `getRoutePriority(pattern)`
Returns the `RoutePriorityEntry` for a pattern, or `undefined` if not set.

### `removeRoutePriority(pattern)`
Removes the priority assignment for a pattern. Returns `true` if removed.

### `getAllPriorities()`
Returns all registered priority entries.

### `getRoutesByPriority(priority)`
Filters entries by a specific priority level.

### `comparePriority(a, b)`
Compares two priority levels numerically. Useful for sorting.

### `getEffectivePriority(pattern)`
Returns the assigned priority, or `'medium'` if none is set.

### `resetPriorities()`
Clears all priority assignments. Intended for testing.

## Example

```ts
import { setRoutePriority, getEffectivePriority } from './routePriority';

setRoutePriority('/api/checkout', 'critical', 'Drives revenue');
console.log(getEffectivePriority('/api/checkout')); // 'critical'
console.log(getEffectivePriority('/api/docs'));     // 'medium' (default)
```
