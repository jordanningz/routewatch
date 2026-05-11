# routeChangelog

The `routeChangelog` module provides a lightweight audit trail for route configuration changes within routewatch. It lets teams record who changed what and when, making it easy to correlate performance regressions with recent configuration updates.

## API

### `logChange(route, author, description, metadata?)`
Records a new changelog entry for the given route.

```ts
logChange("/api/users", "alice", "Enabled circuit breaker", { threshold: 5 });
```

### `getChangelog(route)`
Returns all changelog entries for a route in chronological order.

```ts
const history = getChangelog("/api/users");
```

### `getLatestChange(route)`
Returns the most recent changelog entry for a route, or `undefined` if none exists.

```ts
const latest = getLatestChange("/api/users");
```

### `getChangelogByAuthor(author)`
Returns a map of routes to entries filtered by the given author.

```ts
const aliceChanges = getChangelogByAuthor("alice");
```

### `getAllChangelogs()`
Returns all changelogs for every tracked route.

```ts
const all = getAllChangelogs();
```

### `clearChangelog(route)`
Removes all changelog entries for a specific route.

### `resetChangelogs()`
Clears all changelog data. Primarily intended for use in tests.

## Use Cases

- Audit trail for route configuration changes
- Correlating latency spikes with recent changes
- Team accountability for route ownership changes
