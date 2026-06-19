# Refactoring 1: Move `DifficultyKey` and `DIFFICULTY_KEYS` to `packs.ts`

## Problem

`scoring.ts` currently owns two items that are really metadata about the `Question` type:

```ts
export type DifficultyKey = 'easy' | 'medium' | 'hard';

const DIFFICULTY_KEYS: Record<Question['difficulty'], DifficultyKey> = {
  1: 'easy',
  2: 'medium',
  3: 'hard'
};
```

`Question['difficulty']` is defined in `packs.ts`, but the human-readable labels for those numeric values live in `scoring.ts`. Any future module that needs to display or group by difficulty (e.g. a leaderboard, a stats page, an admin tool) must import from `scoring` — a scoring/calculation module — just to get a label map. That's the wrong dependency direction.

## Proposed Change

Move `DifficultyKey` (type) and `DIFFICULTY_KEYS` (constant, exported) from `scoring.ts` into `packs.ts`, alongside the `Question` type they describe.

**`packs.ts` additions:**
```ts
export type DifficultyKey = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_KEYS: Record<Question['difficulty'], DifficultyKey> = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};
```

**`scoring.ts` update:**
```ts
import type { Question } from './packs';
import { DIFFICULTY_KEYS, type DifficultyKey } from './packs';
// Remove local definitions of DifficultyKey and DIFFICULTY_KEYS
```

## Benefits

- **Cohesion**: all difficulty metadata (numeric values, labels, constraints) lives next to the `Question` type that defines them.
- **Reduced coupling**: scoring logic no longer needs to know about label strings; it imports a utility from the domain model layer instead.
- **Reusability**: other modules (components, analytics, future leaderboard) can use `DIFFICULTY_KEYS` without pulling in scoring logic.
- **No behaviour change**: pure rename/move — the mapping values are identical and all existing tests continue to pass.
