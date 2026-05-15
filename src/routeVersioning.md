# routeVersioning

Track API version metadata for individual routes, including introduction dates, sunset schedules, and free-form notes.

## API

### `setRouteVersion(pattern, info)`

Registers version information for a route pattern.

```ts
setRouteVersion("/api/users", {
  version: "v2",
  introducedAt: "2024-03-01",
  sunsetAt: "2026-03-01",
  notes: "Replaces v1 user endpoint",
});
```

### `getRouteVersion(pattern)`

Returns the `RouteVersionInfo` for the given pattern, or `undefined` if not registered.

### `removeRouteVersion(pattern)`

Removes version info for a pattern. Returns `true` if removed, `false` if not found.

### `getAllVersions()`

Returns a snapshot of all registered version entries as a plain object.

### `getRoutesByVersion(version)`

Returns all route patterns registered under the given version string.

```ts
getRoutesByVersion("v1"); // ["/api/users", "/api/orders"]
```

### `getSunsetRoutes(asOf?)`

Returns routes whose `sunsetAt` date is on or before `asOf` (defaults to now). Useful for auditing deprecated endpoints.

```ts
getSunsetRoutes(); // routes that are past their sunset date today
```

### `resetVersions()`

Clears all version registrations. Intended for use in tests.
