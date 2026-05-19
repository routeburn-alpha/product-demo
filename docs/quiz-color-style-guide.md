# Quiz color style guide

The canonical reference for the Arsenal-themed color system that ships in Quiz Lab today. Use this doc when you're adding a new quiz surface, retuning the palette, or wondering "should this be a token, and which one?"

This is the deliverable for **idea #1 / task #8**.

## Companion docs

- [`quiz-color-audit.md`](./quiz-color-audit.md) — the inventory of color values that existed *before* the Arsenal rebrand. Useful as a historical baseline.
- [`quiz-color-contrast.md`](./quiz-color-contrast.md) — full WCAG AA contrast results. Numbers in this guide come from there; read that for the math.

## Who this is for

- Anyone adding a new component or screen to the quiz app.
- Anyone editing existing quiz CSS.
- Anyone proposing a future palette change — this is the doc you update first.

## What's in scope

Quiz UI surfaces in:
- `app/src/routes/+layout.svelte` (palette tokens at `:root`, nav chrome)
- `app/src/routes/+page.svelte` (pack picker)
- `app/src/routes/play/[pack]/+page.svelte` (quiz play view)

The broader app does not yet have a design system — there is no shared component library and no global stylesheet. The tokens defined below are the design system right now; treat new components as opportunities to consume them, not as license to fork new hex literals.

---

## 1. The Arsenal palette

Two layers live at `:root` in `+layout.svelte`. **Raw brand tokens** name the colors themselves; **semantic quiz tokens** describe what each color means in this UI. Component CSS should consume semantic tokens; raw tokens exist so the palette can be retuned in one place.

### Raw brand tokens

| Token | Hex | RGB | Source |
|---|---|---|---|
| `--arsenal-navy` | `#023474` | (2, 52, 116) | Arsenal FC primary navy |
| `--arsenal-red` | `#EF0107` | (239, 1, 7) | Arsenal FC accent red |
| `--arsenal-gold` | `#9C824A` | (156, 130, 74) | Arsenal FC accent gold |
| `--arsenal-white` | `#FFFFFF` | (255, 255, 255) | On-primary text |

### Semantic quiz tokens

Use these in component CSS, not the raw tokens above.

| Token | Maps to | Use it for |
|---|---|---|
| `--quiz-primary` | `--arsenal-navy` | Primary quiz box backgrounds (e.g. `.question-card`). |
| `--quiz-on-primary` | `--arsenal-white` | Text and icons that sit directly on `--quiz-primary`. |
| `--quiz-accent` | `--arsenal-gold` | Highlights and accent details (badges, dividers, sparing). Not yet used in code — reserved for future surfaces. |
| `--quiz-secondary` | `--arsenal-red` | Important CTAs and interactive states **outside of error semantics**. Not yet used in code — `.next`/`.primary` deliberately stay blue today (see §3, "Why CTAs are still blue"). |
| `--quiz-danger` | `--arsenal-red` | Error and destructive states (wrong answers, alerts). |

`--quiz-secondary` and `--quiz-danger` both currently point at `--arsenal-red`. They're kept separate so the meaning is explicit at the call site, and so a future change (e.g. introducing a distinct CTA color) can be made by retargeting one alias without touching the other.

---

## 2. Applied to the quiz UI: before / after

This is the actual code that landed in PRs #2–#5. Each section lists the surface, the before/after CSS, and the rationale.

### 2.1 Question card (primary quiz box)

The single most prominent surface in the app — the navy "card" that holds the prompt and choices.

**Before** (`app/src/routes/play/[pack]/+page.svelte`):

```css
.question-card {
  background: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 12px;
  padding: 1.75rem;
}
```

**After:**

```css
.question-card {
  background: var(--quiz-primary);  /* Arsenal Navy */
  border: 1px solid #e2e2e2;
  border-radius: 12px;
  padding: 1.75rem;
}
```

**Why:** Idea #1 named this surface explicitly: *"Background: Arsenal Navy for primary quiz boxes."* The audit confirmed `.question-card` was the only element that matched the description. Border stays neutral; revisiting the border belongs to a future contrast-aware pass (see contrast doc §"Note on the default `.choice` border").

### 2.2 Question prompt text

Direct child of the navy card, so directly on a dark background.

**Before:**

```css
.prompt {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;  /* near-black on white → unreadable on navy */
  margin: 0 0 1.5rem;
  line-height: 1.4;
}
```

**After:**

```css
.prompt {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--quiz-on-primary);  /* white on Arsenal Navy = 12.5:1 */
  margin: 0 0 1.5rem;
  line-height: 1.4;
}
```

**Why:** Only text element with a navy backdrop. `.choice`, `.explanation`, and `.next` each carry their own opaque background; their text does not touch navy directly, so they were left alone.

### 2.3 Wrong-answer accents

The "you picked the wrong one" affordance — needs to read as semantically wrong while landing on Arsenal Red rather than the previous generic Tailwind red.

**Before:**

```css
.choice.wrong {
  border-color: #dc2626;   /* tailwind red-600 */
  background: #fef2f2;
  color: #7f1d1d;
}
.choice.wrong .letter {
  background: #dc2626;
  color: #fff;
}
```

**After:**

```css
.choice.wrong {
  border-color: var(--quiz-danger);  /* Arsenal Red */
  background: #fef2f2;               /* unchanged — see Accessibility */
  color: #7f1d1d;                    /* unchanged — see Accessibility */
}
.choice.wrong .letter {
  background: var(--quiz-danger);    /* Arsenal Red */
  color: #fff;
}
```

**Why surface bg & text stayed put:** swapping `.choice.wrong { color: #7f1d1d }` to Arsenal Red on the same light-pink surface drops contrast from ~9 : 1 to ~4.2 : 1 (below AA). The strong red accent goes on the border + letter badge where it has more luminance headroom; the text stays in dark wine.

---

## 3. Usage guidelines

### Do

- **Consume `--quiz-*` semantic tokens in components.** They describe intent; the call site reads cleanly.
  ```css
  color: var(--quiz-on-primary);   /* good — clear intent */
  ```
- **Pair `--quiz-primary` backgrounds with `--quiz-on-primary` text.** That pairing is verified at 12.5 : 1 and is the only contrast guarantee in the system. Any other text-on-primary combination must be independently contrast-checked.
- **Reach for `--quiz-danger` only for error semantics.** Wrong answers, alert states, destructive confirmations. Not for "important" or "brand-y" buttons.
- **Add new semantic tokens when an existing one doesn't fit.** If you need a "success" color and there isn't one, declare `--quiz-success` in `:root` and map it to a raw token (or a new raw token if the brand doesn't cover it).

### Don't

- **Don't hard-code Arsenal hex values in component CSS.**
  ```css
  background: #023474;       /* bad — bypasses the token system */
  background: var(--quiz-primary);  /* good */
  ```
- **Don't reach past the semantic layer to a raw token in components.**
  ```css
  background: var(--arsenal-navy);   /* bad — call sites lose intent */
  background: var(--quiz-primary);   /* good */
  ```
  The raw tokens exist for *defining* semantic aliases, not for direct consumption.
- **Don't use `--quiz-secondary` and `--quiz-danger` interchangeably.** They point at the same color today, but they describe different meanings. Treat the choice at the call site as a stable design decision.

### Why CTAs are still blue

The idea TD mentions Arsenal Red for *"important CTAs"*, but the current CTAs (`.next`, `.primary` "Play again") deliberately stay blue (`#1d4ed8`). Two reasons:

1. **WCAG-semantic separation.** Task #6's spec says *"maintain semantic meaning of red for errors/warnings."* Promoting red to non-destructive CTAs blurs that signal.
2. **Color budget.** With the navy card already dominating the visual field, adding a second high-saturation brand color (red) to the primary forward action would compete for attention with the wrong-answer affordance.

If a future iteration decides red CTAs are the right move, that's a separate idea — at which point `--quiz-secondary` is already in place to consume.

---

## 4. Accessibility summary

Full results live in [`quiz-color-contrast.md`](./quiz-color-contrast.md). Headlines worth knowing at a glance:

| Pair | Ratio | Verdict |
|---|---|---|
| White on Arsenal Navy (`.prompt` on `.question-card`) | **12.46 : 1** | ✓ AA wide pass |
| White on Arsenal Red (`.choice.wrong .letter`) | **4.49 : 1** | ✗ Marginal fail — see follow-up #32 |
| White on green-600 (`.choice.correct .letter`) | **3.30 : 1** | ✗ Pre-existing — see follow-up #32 |
| `#888` secondary labels on light surfaces (`.progress`, `.pack-title`, `.result-label`, `.meta`) | ~**3.4–3.6 : 1** | ✗ Pre-existing — see follow-up #33 |

### Known follow-up tasks

Filed against idea #1, not yet picked up:

- **Task #32** — Bump `.letter` font-size to qualify as WCAG large text, which drops the threshold to 3 : 1 and resolves both letter-badge failures without changing brand colors.
- **Task #33** — Add a `--text-muted: #737373` semantic token and replace the four `#888` use-sites in one sweep.

### Not yet exercised

- **Color vision deficiency (CVD) simulation.** The contrast audit calls out the wrong/correct badges as the highest-risk pair for deuteranopia/protanopia (red ↔ green collapse). Mitigation will likely be a small ✓/✕ icon inside the letter badge so the cue isn't color-only. Worth pairing with task #32 when it lands.
- **Screen-reader walkthrough.** No regressions expected (no ARIA semantics changed), but a one-pass with VoiceOver before declaring idea #1 "All Customers" is a good practice.

---

## 5. Adding to the system

### Adding a new semantic token

1. Decide whether the use case is genuinely new (no existing `--quiz-*` fits) or a missed alias.
2. Add it to `:root` in `app/src/routes/+layout.svelte`, mapped to a raw `--arsenal-*` token (or to a new raw token if it's a new brand color).
3. Add a row to the **Semantic quiz tokens** table in §1 of this doc.
4. Use it.

### Retuning the palette

Single point of change: edit the raw `--arsenal-*` values in `:root`. Every consumer that went through the semantic layer updates automatically. The audit and contrast doc may need to be re-run if hex values change materially.

### Adding a new quiz surface

1. Identify the surface's role (primary box? error feedback? muted label?).
2. Pick the closest existing semantic token. If nothing fits, add one (see above).
3. Compute the foreground/background contrast against the chosen token before shipping. Add a row to the contrast doc.

---

## 6. Source-of-truth file map

| File | Role |
|---|---|
| `app/src/routes/+layout.svelte` | Token definitions live in the `:global(:root)` block. |
| `app/src/routes/+page.svelte` | Pack picker. Currently consumes no Arsenal tokens (rebrand has not reached this surface yet — see below). |
| `app/src/routes/play/[pack]/+page.svelte` | Quiz play view. Consumes `--quiz-primary`, `--quiz-on-primary`, `--quiz-danger`. |

### What this guide intentionally does *not* cover

- The home pack-picker and nav chrome haven't been rebranded yet — they still consume the pre-Arsenal blue/gray palette. Whether to extend the rebrand to those surfaces is an open product decision, not a documentation gap.
- A broader product-wide style guide (typography, spacing, motion). When that doc exists, this guide should be absorbed as its "color" chapter.
- Icons, illustrations, and brand marks. Quiz Lab doesn't ship any today.
