# Route Scorecard

The `routeScorecard` module produces a composite quality score (0–100) for each tracked API route, aggregating data from health, latency budgets, SLAs, and deprecation status.

## Score Breakdown

| Category      | Max Points | Source                  |
|---------------|------------|-------------------------|
| Health        | 40         | `routeHealth`           |
| Latency       | 30         | `routeLatencyBudget`    |
| SLA           | 20         | `routeSLA`              |
| Activity      | 10         | `metrics`, `routeDeprecation` |

## Grades

| Score   | Grade |
|---------|-------|
| 90–100  | A     |
| 75–89   | B     |
| 60–74   | C     |
| 45–59   | D     |
| 0–44    | F     |

## Usage

```ts
import { scoreRoute, scoreAllRoutes } from './routeScorecard';

// Score a single route
const card = scoreRoute('GET /api/users');
console.log(card.grade, card.score, card.flags);

// Score every tracked route, sorted worst-first
const all = scoreAllRoutes();
all.forEach(c => console.log(c.route, c.grade, c.flags));
```

## Flags

- `unhealthy` / `degraded` — from route health assessment
- `latency_critical` — avg duration > 1.5× budget
- `latency_over_budget` — avg duration > budget
- `sla_breach` — error rate exceeds SLA availability target
- `sla_at_risk` — error rate approaching SLA threshold
- `no_traffic` — route has never been called
- `deprecated` — route has an active deprecation record
