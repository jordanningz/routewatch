# Route Notes

The `routeNotes` module lets developers attach human-readable annotations to route patterns. Notes are stored in-memory and are useful for documenting intent, known issues, or reminders about specific routes.

## API

### `addNote(routePattern, note, author?)`

Attaches a note to a route pattern. Optionally include an author name.

```ts
addNote("/api/users", "Rate limited to 100 req/min", "alice");
```

### `getNotes(routePattern)`

Returns all notes attached to the given route pattern.

```ts
const notes = getNotes("/api/users");
// [{ note: "Rate limited...", author: "alice", createdAt: 1700000000000 }]
```

### `clearNotes(routePattern)`

Removes all notes for a specific route.

```ts
clearNotes("/api/users");
```

### `getAllNotes()`

Returns a record of all routes that have notes attached.

```ts
const all = getAllNotes();
```

### `getNotesByAuthor(author)`

Filters notes across all routes by a specific author.

```ts
const myNotes = getNotesByAuthor("alice");
```

### `resetRouteNotes()`

Clears all notes. Intended for use in tests.

## Notes

- Notes are stored in-memory and are not persisted across restarts.
- Multiple notes can be added to the same route.
- Notes do not affect routing behavior or middleware execution.
