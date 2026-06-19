# Refactoring Suggestion: Extract `reducedMotion` as a Shared Svelte Store

## Finding

The `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check is
duplicated inline across two components:

| File | Occurrences |
|------|-------------|
| `app/src/lib/components/HeroSection.svelte` | 2 (typewriter `$effect`, parallax `$effect`) |
| `app/src/lib/components/PackGrid.svelte` | 1 (flip-animation `$effect`) |

Each call is a one-shot snapshot read: the value is captured once when the
effect runs and is never updated if the user toggles their OS accessibility
preference mid-session.

## Proposed Refactoring

Create a single reactive store in `app/src/lib/stores/reduced-motion.ts`:

```ts
import { readable } from 'svelte/store';

/**
 * Reactive boolean that mirrors the OS "prefer reduced motion" setting.
 * Re-evaluates automatically if the user changes the preference mid-session.
 * Always `false` during SSR (no `window`).
 */
export const reducedMotion = readable(false, (set) => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  set(mq.matches);
  const handler = (e: MediaQueryListEvent) => set(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
});
```

Then replace the ad-hoc calls in each component:

**`HeroSection.svelte`** — replace both `$effect` blocks that call
`window.matchMedia(…).matches` with a single `$derived` driven by the store:

```svelte
<script lang="ts">
  import { reducedMotion } from '$lib/stores/reduced-motion';
  // reducedMotion is already reactive; use $reducedMotion wherever needed
</script>
```

**`PackGrid.svelte`** — replace the `$effect` that sets `reduceMotion` with a
direct store subscription:

```svelte
<script lang="ts">
  import { reducedMotion } from '$lib/stores/reduced-motion';
  // use $reducedMotion in place of the local `reduceMotion` state variable
</script>
```

## Why This Refactoring Is Worth Doing

1. **Eliminates duplication.** Three scattered `matchMedia` calls collapse into
   one canonical definition with a clear home.

2. **Adds reactivity.** The store listens to the `change` event on the
   `MediaQueryList`, so if a user updates their OS accessibility setting while
   the app is open the UI responds immediately. The current snapshot reads do
   not.

3. **SSR-safe.** The guard on `typeof window` means the store returns `false`
   during SvelteKit's server-side render, matching the existing pattern in
   `PackGrid` (which already defaults `reduceMotion` to `false`).

4. **Testable in isolation.** Pure store logic is easy to test by mocking
   `window.matchMedia`; component-level `$effect` tests require mounting the
   full component.

5. **Scales.** Any future component that needs this signal imports the store
   rather than repeating the boilerplate.

## Scope

- **New file:** `app/src/lib/stores/reduced-motion.ts`
- **Modified files:** `HeroSection.svelte`, `PackGrid.svelte`
- **No other files change.** The CSS `@media (prefers-reduced-motion: no-preference)` rules stay as-is — CSS handles the static animation opt-out; the store only covers the JS-driven animation paths.
