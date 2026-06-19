# Refactoring Analysis — Quiz Lab

Top 5 refactorings ranked by impact on correctness, testability, and long-term maintainability.

---

## 1. Extract the play-screen state machine from `+page.svelte` into a testable function

**Impact: High**

`app/src/routes/play/[pack]/+page.svelte` contains a non-trivial client-side state machine
(index, selected, answers, finished, question timing, XP baseline) implemented entirely as
inlined Svelte 5 runes state with no unit-test coverage. The logic for `choose()`, `next()`, and
`restart()` — including the timing calculation (`performance.now()` diffing) and the answer
accumulation — is correct today but fragile: any regression will only surface during manual
browser testing.

**Proposed shape:**
```ts
// lib/game.ts
export type GameState = { index: number; selected: number | null; answers: AnswerRecord[]; finished: boolean };
export function createGameSession(questions: Question[]): {
  state: GameState;
  choose(i: number): GameState;
  next(): GameState;
  restart(): GameState;
}
```

The Svelte component becomes a thin view over the returned state; the session function is
unit-testable in isolation with Vitest just like `scoring.ts` and `player.ts` already are.
The timing dependency (`performance.now`) can be injected for deterministic tests.

---

## 2. Split pure functions from effectful store operations in `player.ts`

**Impact: High**

`app/src/lib/player.ts` mixes two distinct concerns in a single 140-line file:

- **Pure domain logic** (`levelFor`, `xpForAnswer`, `awardForAnswer`, `recordPlay`, `dayGap`) —
  already unit-tested in `player.test.ts`.
- **Effectful infrastructure** (`loadPlayer`, `savePlayer`, the Svelte `writable` store,
  `initPlayer`, `applyAnswer`, `applyCompletion`) — zero test coverage, tightly coupled to
  `localStorage` and the Svelte runtime.

This coupling makes it impossible to test the store update paths without a browser environment.
Splitting into `player.ts` (pure, stays as-is) and `playerStore.ts` (store + persistence layer,
depends on `player.ts`) allows the persistence layer to be swapped (e.g. to the future AppSync +
DynamoDB backend documented in ARCHITECTURE.md §11) without touching the domain logic, and
enables testing `applyAnswer` / `applyCompletion` with a mock `localStorage`.

---

## 3. Add runtime schema validation in `listPacks()` / `getPack()` to catch malformed content at build time

**Impact: Medium-High**

`app/src/lib/packs.ts` loads every pack with a raw `JSON.parse()` cast to `Pack` — there is no
runtime check that the file actually satisfies the type. Because all rendering is prerendered
(build-time only), a malformed pack silently passes TypeScript's structural typing and ships.
The known mismatch documented in ARCHITECTURE.md §5 — `Question.difficulty` is typed `1 | 2 | 3`
but content authoring uses 1–5 — is one concrete gap this would catch.

**Proposed shape:**
```ts
import { z } from 'zod';

const QuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  choices: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string()
});
```

A `z.parse()` call inside `listPacks()` turns schema errors into build failures (via the
`strict: true` prerender setting), surfacing content mistakes before they reach production.
Zod is already a common SvelteKit dependency; alternatively `valibot` has a smaller bundle
footprint for a build-only module.

---

## 4. Extract the floating-ui hover popover in `PackGrid.svelte` into a reusable Svelte action

**Impact: Medium**

`PackGrid.svelte` contains ~40 lines of floating-ui wiring (`autoUpdate`, `computePosition`,
`offset`, `flip`, `shift`, shared `cleanup` ref) inlined in the component. This logic is
component-specific today but would be useful in any future card-grid surface (e.g. a future
"leaderboard" or "featured pack" component). More immediately, inlining it makes the component
hard to read: the popover plumbing is interleaved with the grid layout and arrow-key navigation
logic.

**Proposed shape:**
```ts
// lib/actions/popover.ts
export function popover(node: HTMLElement, target: HTMLElement): { destroy(): void }
```

The action encapsulates `autoUpdate` + `computePosition` and cleans up on `destroy`. The
component reduces to `use:popover={popoverEl}` on each card anchor, with visibility still
driven by Svelte state. This is a standard Svelte idiom and drops the manual `$effect(() => () =>
cleanup?.())` cleanup pattern.

---

## 5. Consolidate duplicate difficulty-range calculations into `packs.ts`

**Impact: Low-Medium**

Difficulty summarisation logic appears in two places with slightly different shapes:

- `PackGrid.svelte` → `difficultyRange(qs)` returns `{ min, max } | null`
- `+page.svelte` (home route) → `minDifficulty(p)` returns a number for sort ordering

Both traverse `pack.questions` to aggregate `difficulty`. Because `Pack` and `Question` are
defined in `packs.ts`, the natural home for these helpers is that same module — keeping domain
logic co-located with the type it operates on and preventing a future third caller from writing
a third variant.

**Proposed additions to `packs.ts`:**
```ts
export function difficultyRange(questions: Question[]): { min: number; max: number } | null { … }
export function minDifficulty(pack: Pack): number { … }
```

Both components import from `$lib/packs` instead of inlining their own copies. This is a small
change with outsized DRY benefit if additional pack-display surfaces are added.
