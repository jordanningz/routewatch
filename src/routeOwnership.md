# Route Ownership

The `routeOwnership` module lets you assign owners and teams to route patterns, making it easy to track accountability for API routes.

## API

### `assignOwner(pattern, owner, team?)`
Assigns an owner (and optional team name) to a route pattern.

```ts
import { assignOwner } from './routeOwnership';
assignOwner('/api/users', 'alice', 'platform');
```

### `removeOwner(pattern)`
Removes the ownership entry for the given pattern. Returns `true` if removed, `false` if not found.

### `getOwner(pattern)`
Returns the `OwnershipEntry` for a pattern, or `undefined` if not set.

```ts
const entry = getOwner('/api/users');
// { owner: 'alice', team: 'platform', assignedAt: 1710000000000 }
```

### `getRoutesByOwner(owner)`
Returns all route patterns assigned to a specific owner.

```ts
const routes = getRoutesByOwner('alice');
// ['/api/users', '/api/orders']
```

### `getRoutesByTeam(team)`
Returns all route patterns belonging to a specific team.

```ts
const routes = getRoutesByTeam('platform');
```

### `getAllOwnership()`
Returns a snapshot of all ownership entries keyed by route pattern.

### `resetOwnership()`
Clears all ownership data. Primarily used in tests.

## Use Case

Combine with `routeNotes`, `routeDeprecation`, or alerting to route notifications to the correct team when a slow or failing route is detected.
