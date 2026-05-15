# routeRunbook

Attach runbook URLs and operational notes to route patterns for use during incident response and on-call triage.

## Overview

The `routeRunbook` module lets you associate a documentation URL (and optional metadata) with any monitored route pattern. These runbooks can be surfaced by alerting handlers or the metrics dashboard to help on-call engineers quickly find relevant procedures.

## API

### `setRunbook(pattern, url, options?)`

Registers or updates the runbook for a route pattern.

- `pattern` — route pattern string, e.g. `"GET /users/:id"`
- `url` — link to the runbook document
- `options.summary` — short human-readable description
- `options.updatedBy` — author or team updating the entry

Returns the stored `RunbookEntry`.

### `getRunbook(pattern)`

Returns the `RunbookEntry` for the given pattern, or `undefined` if none exists.

### `removeRunbook(pattern)`

Deletes the runbook entry for the pattern. Returns `true` if removed, `false` if not found.

### `getAllRunbooks()`

Returns a record of all stored runbooks keyed by route pattern.

### `hasRunbook(pattern)`

Returns `true` if a runbook exists for the given pattern.

### `resetRunbooks()`

Clears all stored runbook entries. Useful in tests.

## HTTP API (`runbookRouter`)

Mount `createRunbookRouter()` to expose runbook data over HTTP:

```ts
import { createRunbookRouter } from "routewatch";
app.use("/runbooks", createRunbookRouter());
```

| Method | Path | Description |
|--------|------|-------------|
| GET | `/runbooks` | List all runbooks |
| GET | `/runbooks/:pattern` | Get runbook for a pattern |
| PUT | `/runbooks/:pattern` | Create or update a runbook |
| DELETE | `/runbooks/:pattern` | Remove a runbook |

Patterns in URL segments must be `encodeURIComponent`-encoded.
