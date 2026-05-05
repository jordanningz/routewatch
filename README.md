# routewatch

Lightweight Express middleware for logging and alerting on slow API routes.

## Installation

```bash
npm install routewatch
```

## Usage

```typescript
import express from 'express';
import { routewatch } from 'routewatch';

const app = express();

// Log any route that takes longer than 500ms
app.use(routewatch({
  threshold: 500,
  onSlowRoute: (info) => {
    console.warn(`Slow route detected: ${info.method} ${info.path} took ${info.duration}ms`);
  },
}));

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(3000);
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` | `1000` | Response time in ms before a route is flagged |
| `onSlowRoute` | `function` | `console.warn` | Callback fired when a slow route is detected |
| `logger` | `function` | `console.log` | Custom logger for all route activity |

### Route Info Object

The `onSlowRoute` callback receives an object with the following properties:

- `method` — HTTP method (e.g. `GET`, `POST`)
- `path` — The matched route path
- `duration` — Response time in milliseconds
- `statusCode` — HTTP response status code
- `timestamp` — ISO timestamp of the request

## License

MIT