# routeRateProfile

Tracks per-route request rate profiles, including current requests-per-minute (RPM), peak RPM, and a rate tier classification.

## Rate Tiers

| Tier       | RPM Range     |
|------------|---------------|
| `idle`     | 0             |
| `low`      | 1 – 9         |
| `medium`   | 10 – 99       |
| `high`     | 100 – 499     |
| `critical` | 500+          |

## API

### `recordRateHit(route: string): RateProfile`
Records a single request hit for the given route and returns the updated profile.
Rate calculations use a 60-second sliding window.

### `getRateProfile(route: string): RateProfile | undefined`
Returns the current rate profile for a route, or `undefined` if not yet tracked.

### `getAllRateProfiles(): RateProfile[]`
Returns rate profiles for all tracked routes.

### `getRoutesByRateTier(tier: RateTier): string[]`
Returns a list of route paths currently classified under the given tier.

### `resetRateProfiles(): void`
Clears all stored rate profiles. Useful for testing.

## HTTP Endpoints (via `createRateProfileRouter`)

| Method | Path                        | Description                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | `/rate-profiles`            | List all rate profiles                      |
| GET    | `/rate-profiles/tier/:tier` | List routes matching a tier                 |
| GET    | `/rate-profiles/route`      | Get profile for a route (`?path=<route>`)   |

## Usage

```ts
import { recordRateHit } from './routeRateProfile';

// In your routewatch middleware or route handler:
recordRateHit('/api/users');
```

Mount the router to expose profiles over HTTP:

```ts
import { createRateProfileRouter } from './rateProfileRouter';
app.use('/rate-profiles', createRateProfileRouter());
```
