# routeEnvironment

Associate Express routes with deployment environments so you can filter, inspect, and reason about which routes are active in which environments.

## Usage

```ts
import {
  setRouteEnvironment,
  getRouteEnvironment,
  getRoutesByEnvironment,
  isRouteInEnvironment,
} from './routeEnvironment';

// Tag a route with an environment
setRouteEnvironment('/api/users', 'production', 'alice');

// Retrieve the environment for a route
const entry = getRouteEnvironment('/api/users');
// { route: '/api/users', environment: 'production', setAt: Date, setBy: 'alice' }

// Find all routes in a given environment
const prodRoutes = getRoutesByEnvironment('production');

// Check if a specific route belongs to an environment
if (isRouteInEnvironment('/api/users', 'production')) {
  console.log('Route is live in production');
}
```

## API

### `setRouteEnvironment(route, environment, setBy?)`
Registers or updates the environment for a route. Returns the created `EnvironmentEntry`.

### `getRouteEnvironment(route)`
Returns the `EnvironmentEntry` for the given route, or `undefined` if not set.

### `removeRouteEnvironment(route)`
Removes the environment entry for a route. Returns `true` if it existed.

### `getAllEnvironments()`
Returns all registered environment entries.

### `getRoutesByEnvironment(environment)`
Returns all entries matching the given environment string.

### `isRouteInEnvironment(route, environment)`
Returns `true` if the route is registered under the specified environment.

### `resetEnvironments()`
Clears all environment entries. Useful in tests.

## Environment Values

The `Environment` type accepts `'production'`, `'staging'`, `'development'`, `'test'`, or any custom string.
