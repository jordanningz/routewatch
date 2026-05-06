# Correlation ID Middleware

The `correlationId` module provides Express middleware that attaches a unique correlation ID to every incoming request. This ID can be used to trace a request through logs, alerts, and metrics.

## Usage

```ts
import { correlationIdMiddleware, getCorrelationId } from './correlationId';

app.use(correlationIdMiddleware);

app.get('/example', (req, res) => {
  const id = getCorrelationId(req);
  console.log(`Handling request ${id}`);
  res.json({ ok: true });
});
```

## Configuration

```ts
import { configureCorrelationId } from './correlationId';

configureCorrelationId({
  header: 'x-request-id',   // Header to read/write (default: 'x-correlation-id')
  propagate: true,           // Echo the ID in the response header (default: true)
  generateId: () => 'custom-id-generator',
});
```

## API

| Function | Description |
|---|---|
| `correlationIdMiddleware` | Express middleware to attach a correlation ID |
| `getCorrelationId(req)` | Retrieve the correlation ID from a request |
| `configureCorrelationId(options)` | Update the global configuration |
| `getCorrelationIdConfig()` | Read the current configuration |
| `resetCorrelationIdConfig()` | Restore defaults |

## Behaviour

- If the incoming request already contains a correlation ID header, it is reused.
- Otherwise, a new UUID is generated via `crypto.randomUUID()`.
- When `propagate` is `true` (default), the ID is echoed back in the response header so clients can correlate responses.
