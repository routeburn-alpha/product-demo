# Quiz Lab UI audit

Comprehensive review of every user-facing surface in Quiz Lab. Inventories the existing design patterns, flags inconsistencies, and catalogs extraneous or vestigial elements. Companion to the earlier color-only audits ([`quiz-color-audit.md`](./quiz-color-audit.md), [`quiz-color-contrast.md`](./quiz-color-contrast.md)) and the [`quiz-color-style-guide.md`](./quiz-color-style-guide.md).

This document is the deliverable for **idea #2 / task #9** (Conduct comprehensive UI audit across all interfaces). It is intentionally read-only — no code is changed by this task. Each finding below is phrased as a discrete issue so it can be promoted into a follow-up task in idea #2.

## Methodology

- **Scope:** every route the user can reach today, and every state each route can render. Source of truth was the SvelteKit code at HEAD, not a running browser — the app has three route files and they fully describe the rendered output. Visual descriptions in §1 are derived from the markup + scoped CSS; no rendered screenshots were captured because this environment has no browser tooling, and the static markup is short enough to describe in full. If a future pass adds browser screenshots, drop them next to each surface in §1.
- **Axes audited:** layout & spacing, typography, color, button & control styles, interaction patterns (hover / focus / disabled / motion), and extraneous or vestigial content.
- **What "inconsistency" means here:** the same role (e.g. "muted body text", "primary action button", "card divider") is implemented with **different concrete values** at different sites, with no design-system reason for the divergence. Where a divergence is intentional and documented (e.g. CTAs deliberately blue rather than Arsenal red — see [style guide §3](./quiz-color-style-guide.md#why-ctas-are-still-blue)), it is noted but not flagged as an issue.
- **What "extraneous" means here:** content or markup that is no longer load-bearing — duplicate font stacks, ARIA labels that contradict the data model, links pointing at the wrong repo, etc.

## Files in scope

| File | Role | Lines |
| --- | --- | --- |
| `app/src/routes/+layout.svelte` | Top nav, palette tokens, body background | 76 |
| `app/src/routes/+page.svelte` | Pack picker (home) | 277 |
| `app/src/routes/play/[pack]/+page.svelte` | Quiz play view — progress, question, choices, explanation, result, empty state | 359 |

There are **no shared component files** — every quiz surface is inline markup with a scoped `<style>` block in the relevant route. This shapes the rest of the audit: most inconsistencies below exist because there is no single component or token to consult, so each surface picks its own value.

---

## 1. Surface-by-surface breakdown

For each surface: a textual "rendered view" sketch, the live markup region, and the live style region. Use these as the visual reference until screenshots land.

### 1.1 Nav chrome — `app/src/routes/+layout.svelte`

**Rendered view (sketch).**

```
┌──────────────────────────────────────────────────────────────┐
│ Quiz Lab                                     View on GitHub  │   ← top nav, max-width 880px
└──────────────────────────────────────────────────────────────┘
  (page content below)                                          ← body bg #fafafa
```

- Two-element flex row, justified.
- **Brand**: weight 800, 1rem, near-black `#111`, letter-spacing `-0.01em`.
- **GitHub link**: weight 400, 0.85rem, `#666`; hover `#1d4ed8`.

### 1.2 Pack picker (home) — `app/src/routes/+page.svelte`

**Rendered view (sketch).**

```
┌──────────────────────────────────────────────────────────────┐
│ Quiz Lab                                                     │   h1 — 2.25rem, 800, #111
│ Pick a pack. Race the clock. …                               │   subtitle — 1rem, #555
│                                                              │
│ ┌──── pack card ────┐ ┌──── pack card ────┐ ┌──── pack ── │
│ │ [cover 16:9]      │ │ [cover 16:9]      │ │ [cover 16:9 │
│ │ CATEGORY          │ │ CATEGORY          │ │ CATEGORY    │
│ │ Pack Title        │ │ Pack Title        │ │ Pack Title  │
│ │ Description…      │ │ Description…      │ │ Description │
│ │ ───────────────── │ │ ───────────────── │ │ ──────────  │
│ │ 12 questions  ★★  │ │ 8 questions   ★–★★│ │ 10 questions│
│ └───────────────────┘ └───────────────────┘ └─────────────│
│                                                              │
│ ─────────────────────────────────────────────────            │
│ Want to add your own pack? Drop a JSON file in…              │   page footer
└──────────────────────────────────────────────────────────────┘
```

- `.container` max-width 880px, padding `2.5rem 2rem`.
- Grid: `repeat(auto-fill, minmax(260px, 1fr))`, gap `1rem`.
- Each card: white surface, border `#e2e2e2`, radius **12px**, hover lifts (`translateY(-3px) scale(1.01)`) gated by `prefers-reduced-motion: no-preference`.
- Optional "New" pill (top-right of cover) for packs added in the last 14 days.
- Optional difficulty range as filled stars, e.g. `★` or `★ – ★★`. ARIA label `Difficulty {min} of 3` (see §4 issue **I-12**).

### 1.3 Quiz play — `app/src/routes/play/[pack]/+page.svelte`

This file renders five distinct states. They're listed here as separate surfaces because each has its own visual language.

#### 1.3.1 Empty pack ("Coming soon")

```
← All packs

┌──────────────────────────────────────────────────────────────┐
│           Coming soon                                        │   .result-label (uppercase, muted)
│           This pack is being assembled…                      │   .result-summary
│           [ Pick another pack ]                              │   .secondary (anchor, blue outline)
└──────────────────────────────────────────────────────────────┘
```

- Reuses the `.result-card` styling (centered, white surface). Only `.result-label` + `.result-summary` are populated — there is no score number.
- A `.primary` button is intentionally absent (nothing to play).

#### 1.3.2 Question — initial state

```
← All packs                              Question 3 of 12          ← .progress-row, 0.85rem
PREMIER LEAGUE                                                    ← .pack-title, uppercase, muted

┌────────────── question-card (Arsenal navy) ──────────────┐
│ Who won the Premier League in 2003-04?                   │     .prompt, 1.25rem 600, white
│                                                          │
│ ┌───────────────────────────────────────────────────┐    │
│ │ [A]  Arsenal                                       │   │     .choice — white, border #e2e2e2, radius 10px
│ ├───────────────────────────────────────────────────┤    │
│ │ [B]  Chelsea                                       │   │
│ ├───────────────────────────────────────────────────┤    │
│ │ [C]  Manchester United                             │   │
│ ├───────────────────────────────────────────────────┤    │
│ │ [D]  Liverpool                                     │   │
│ └───────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

- Choices: vertical stack, `gap: 0.625rem`, each with a 2.25rem letter badge on the left.
- Border on choices is **1.5px** (every other border in the app is 1px — see issue **I-3**).

#### 1.3.3 Question — answered state

```
                                                                   .question-card unchanged
│ [A]  Arsenal                                  (correct: green) │  ← .choice.correct (border + bg + letter green)
│ [B]  Chelsea                                                  │
│ [C]  Manchester United          (wrong: red, if user picked)  │  ← .choice.wrong
│ [D]  Liverpool                                                │

┌──────── .explanation (correct or wrong, light surface) ──────┐
│ Correct!  Arsenal went unbeaten — "The Invincibles."         │
└──────────────────────────────────────────────────────────────┘
[ Next question → ]                                                ← .next, full-width, blue, 0.95rem
```

- All choice buttons become `disabled` after selection.
- Choice color states (`.correct`, `.wrong`) cover border, background, text, **and** the inner `.letter` badge — five property pairs per state, declared at each call site.

#### 1.3.4 Result card

```
┌──────────────────────────────────────────────────────────────┐
│                       YOU SCORED                              │  .result-label, uppercase muted
│                                                              │
│                       9 / 12                                 │  .result-score, 4rem 800, blue
│                                                              │
│           Strong showing — try one of the other packs next.  │  .result-summary
│                                                              │
│        [ Play again ]   [ Pick another pack ]                │  .primary + .secondary
└──────────────────────────────────────────────────────────────┘
```

- `.primary` is a `<button>`. `.secondary` is an `<a>`. They share padding, radius, font-size, but the secondary has a 1.5px border to occupy the same visual weight.
- Result summary text branches on score band (perfect / ≥70% / ≥40% / lower) — copy-only difference.

#### 1.3.5 Question page — progress chrome

The `.progress-row` + `.pack-title` pair sits above the navy card and is shared by the question and answered states. It uses the muted neutral token (`--text-muted`) and a 0.85rem font size for the row, then a 1rem **uppercase** label below.

---

## 2. Design-system snapshot at HEAD

What the system actually is, as opposed to what any single file thinks it is:

### 2.1 Color

| Layer | Where it's defined | Coverage |
|---|---|---|
| Arsenal palette tokens (`--arsenal-*`, `--quiz-*`, `--text-muted`) | `:global(:root)` in `+layout.svelte` | Used in the question card surface, the prompt, and `.choice.wrong` accents. Not used on the home or in CTAs. |
| Tailwind-style hex literals (`#1d4ed8`, `#16a34a`, `#cbd5e1`, …) | Inline in every component | Pack picker, all CTAs, focus rings, hover backgrounds, "correct" states, range-dash, cover gradients. |
| Ad-hoc grays (`#111`, `#222`, `#555`, `#666`, `#737373` via token, `#94a3b8`, `#64748b`) | Inline in every component | Body text, muted text, divider borders. Five distinct gray "ramps" coexist. |

The token system documented in [`quiz-color-style-guide.md`](./quiz-color-style-guide.md) is the **closest the project has to a design system**, but it explicitly does not yet cover the pack picker or any neutrals beyond `--text-muted`.

### 2.2 Typography

- **Font stack** (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) is repeated **three** times: `.top-nav`, `.container` (home), `.container` (play). There is no body-level declaration. See issue **I-1**.
- **Type ramp in use** (collected from every `font-size` in the codebase):

  | Size | Sites |
  |---|---|
  | 4rem | result-score (number) |
  | 3.5rem | cover-emoji |
  | 3rem | cover-letter |
  | 2.25rem | home h1 |
  | 2rem | result-score `.of` suffix |
  | 1.25rem | prompt, letter badge (1.2rem) |
  | 1.05rem | pack-card h2 |
  | 1rem | brand, subtitle, pack-title, result-summary |
  | 0.95rem | choice, next, primary, secondary |
  | 0.9rem | explanation, result-label |
  | 0.875rem | description, page footer |
  | 0.85rem | github link, progress-row |
  | 0.8rem | pack-card footer |
  | 0.7rem | new-pill |
  | 0.65rem | category pill |

  Fourteen distinct sizes across three files — denser than the [Tailwind default scale](https://tailwindcss.com/docs/font-size) in the same range, and with no documented intent.
- **Weights** in use: 400 (default), 500 (back link), 600, 700, 800. No documented weight ramp.
- **Letter-spacing** is declared at eight different sites with values `-0.04em` / `-0.02em` / `-0.01em` / 0 / `0.04em` / `0.05em` / `0.06em` / `0.1em`. Tightening at large display sizes (h1, cover-letter) is conventional; the differences across the small uppercase labels (`category` 0.06, `pack-title` 0.04, `result-label` 0.05, `new-pill` 0.06, `difficulty` 0.1) read as drift.

### 2.3 Spacing

- **Container widths.** Home = 880px, play = 640px, nav = 880px. Defensible (play is narrower for legibility), but worth declaring as a deliberate decision.
- **Container padding.** Home `2.5rem 2rem`, play `1rem 1.5rem 3rem`, nav `1rem 2rem`. The vertical asymmetry on the play page (1rem top, 3rem bottom) is undocumented.
- **Card padding.** `.question-card` 1.75rem, `.result-card` `3rem 2rem`, `.pack-card .body` `1rem 1.25rem 0.75rem`. Three different "card" padding conventions.
- **Gap.** Pack grid 1rem, choices 0.625rem, result actions 0.75rem, progress row spreads with `justify-content`. No shared spacing scale.

### 2.4 Border radius

Six radius values are in active use:

| Radius | Surface |
|---|---|
| 999px | `.new-pill` |
| 12px | `.pack-card`, `.question-card`, `.result-card` |
| 10px | `.choice` |
| 8px | `.explanation`, `.next`, `.primary`, `.secondary` |
| 6px | `.letter` badge |
| 4px | `.category` pill, inline `<code>` |

The three "container" surfaces agree at 12px (good), but the four control surfaces split 8px / 10px without a clear reason (`.choice` is the outlier — see issue **I-4**).

### 2.5 Border colors

`#e2e2e2` is the de facto divider in five places (card outlines, choice default, page footer). Three other gray borders coexist:

| Color | Sites |
|---|---|
| `#e2e2e2` | All cards, default choice, page footer |
| `#cbd5e1` | Pack-card hover |
| `#f1f5f9` | Pack-card footer divider |
| `#94a3b8` | Range-dash separator in difficulty stars |

### 2.6 Buttons & interactive controls

| Control | Tag | Padding | Font-size | Radius | Border | Background | Text | Hover |
|---|---|---|---|---|---|---|---|---|
| Pack card | `<a>` | n/a (whole card) | inherited | 12px | 1px `#e2e2e2` → `#cbd5e1` | `#fff` | inherit | lift + shadow |
| Choice | `<button>` | `0.875rem 1rem` | 0.95rem | 10px | **1.5px** `#e2e2e2` | `#fff` | `#222` | border `#1d4ed8`, bg `#f5f9ff` |
| Next | `<button>` | `0.75rem 1rem` | 0.95rem | 8px | none | `#1d4ed8` | `#fff` | bg `#1e40af` |
| Primary (result) | `<button>` | `0.75rem 1.25rem` | 0.95rem | 8px | none | `#1d4ed8` | `#fff` | bg `#1e40af` |
| Secondary (result) | `<a>` | `0.75rem 1.25rem` | 0.95rem | 8px | **1.5px** `#1d4ed8` | `#fff` | `#1d4ed8` | bg `#f5f9ff` |
| Back link | `<a>` | none | 0.85rem | n/a | none | transparent | `#1d4ed8` | underline |
| Brand / GitHub link | `<a>` | none | 1rem / 0.85rem | n/a | none | transparent | `#111` / `#666` | brand none / github `#1d4ed8` |
| Category pill | `<span>` | `0.15rem 0.5rem` | 0.65rem | 4px | none | `#f0f9ff` | `#1d4ed8` | n/a |
| New pill | `<span>` | `0.2rem 0.55rem` | 0.7rem | 999px | none | `#fff` | `#111` | n/a |

The `.next`, `.primary`, and `.secondary` controls are clearly siblings (identical font-size + radius), but `.next` deviates in horizontal padding and is a child of the navy card while the other two live in the result card. `.choice` is meant to be the dominant interactive surface but uses a different radius (10px) and the only 1.5px border in the app.

### 2.7 Interaction patterns

| State | Where it's handled | Notes |
|---|---|---|
| Hover | `.pack-card`, `.choice` (not when disabled), `.next`, `.primary`, `.secondary`, `.back`, `.github` | Each declares its own transition timing — 100ms / 120ms / 200ms — without coordination. |
| Focus visible | `.pack-card` only (`outline: 3px solid #1d4ed8`) | Every button, link, and choice falls back to the browser default. See issue **I-7**. |
| Disabled | `.choice` after a selection | Cursor becomes `default`. No visual disabled state beyond keeping the post-answer color modifiers. |
| Reduced motion | `.pack-card` lift is gated by `prefers-reduced-motion: no-preference` | `.choice`, `.next`, `.primary`, `.secondary` declare transitions unconditionally. |
| Active / pressed | None declared | Tap on mobile flashes browser default. |
| Keyboard | All controls are real `<a>` / `<button>` (no `role`-only widgets) | Choice keyboard order is DOM order; Tab traversal is left-to-right top-to-bottom. |

---

## 3. Extraneous & vestigial content

Things in the codebase that are no longer pulling their weight, or are actively wrong.

### X-1. Nav "View on GitHub" points at the wrong repo

`+layout.svelte:14` links to `https://github.com/routeburn-alpha/product-demo-template`. The repo this app actually lives in is `routeburn-alpha/product-demo` (confirmed in `.git/config` and in `ARCHITECTURE.md`'s project structure block). The link 404s for anyone who clicks it.

### X-2. Duplicate font-family declarations

The same `-apple-system, …, sans-serif` stack is declared on `.top-nav`, `.container` (home), and `.container` (play). One declaration at `body` (or as a CSS custom property) would replace all three. See issue **I-1**.

### X-3. `--quiz-accent` and `--quiz-secondary` are declared but never consumed

`+layout.svelte` defines `--quiz-accent` (gold) and `--quiz-secondary` (red) at `:root`, and the style-guide acknowledges they aren't used yet. They're not extraneous *yet* — the style guide reserves them — but flag for review on the next palette change to confirm they're still intended.

### X-4. ARIA label hardcodes "of 3"

The pack-card difficulty stars use `aria-label="Difficulty {min} of 3"` / `"Difficulty {min} to {max} of 3"`. That number is correct relative to the `Question.difficulty` TypeScript type (`1 | 2 | 3`), but it's repeated as a literal string inside the markup. If the type ever widens (the quiz-content-conventions skill, for instance, documents a 1–5 scale), the label silently lies. See issue **I-12**.

### X-5. Two un-used color tokens overlap (`--quiz-secondary` ↔ `--quiz-danger`)

Both alias `--arsenal-red`. The style guide explains *why* they're kept separate — fine — but the only one currently consumed is `--quiz-danger`. If `--quiz-secondary` doesn't land in a CTA, this duplication will need a sunset decision.

### X-6. `.pack-card:focus-visible` outlines the entire card

The pack card is the only element with a custom focus ring, and the ring wraps the entire 260px-wide card. That's correct because the whole card is the link, but the **outline-offset of 3px** combined with the card's `box-shadow` on hover produces a halo that's noticeably heavier than any other focus indicator (because no other interactive surface defines one — see issue **I-7**).

---

## 4. Inconsistency catalog

Each entry is sized to be promoted into a follow-up task.

### I-1. Three duplicated font stacks

- **Where:** `.top-nav` (`+layout.svelte:56`), `.container` (`+page.svelte:96`), `.container` (`play/[pack]/+page.svelte:125`).
- **Issue:** the same stack is declared at three sites; no `body` rule exists.
- **Fix sketch:** declare `font-family` once on `:global(body)` in `+layout.svelte`, remove the three duplicates.

### I-2. Five gray "ramps" coexist

- **Where:** every component.
- **Issue:** body / muted text and divider borders pull from at least five distinct gray scales (`#111`/`#222`/`#555`/`#666`/`#737373` for text; `#e2e2e2`/`#cbd5e1`/`#f1f5f9`/`#94a3b8`/`#64748b` for surfaces & borders).
- **Fix sketch:** define a `--text-strong`, `--text-default`, `--text-muted` (already exists), `--border-strong`, `--border-default`, `--border-soft` set alongside the Arsenal tokens. Migrate each existing literal to the closest token.

### I-3. Choice button uses a 1.5px border; everything else uses 1px

- **Where:** `.choice` (`play/[pack]/+page.svelte:186`) and `.secondary` (`:353`).
- **Issue:** the 1.5px border-width is unique to these two controls. It makes the choice buttons read heavier than the surrounding card border (1px) but is undocumented.
- **Fix sketch:** standardise on either 1px or 1.5px across all interactive borders; pick one based on the desired contrast against the navy card.

### I-4. Choice button radius (10px) drifts from sibling controls (8px)

- **Where:** `.choice` (`play/[pack]/+page.svelte:187`) vs `.next` / `.primary` / `.secondary` (all 8px).
- **Issue:** the radius scale in §2.4 splits the four controls 1-vs-3 without rationale.
- **Fix sketch:** either set `.choice` to 8px so all controls share the value, or define a documented "input vs action" split and apply it consistently.

### I-5. Three transition timings coexist (100ms / 120ms / 200ms)

- **Where:** `.pack-card` (120ms + 200ms), `.choice` / `.next` / `.primary` (100ms).
- **Issue:** no shared motion token. The 120ms on the pack-card border vs the 100ms on the choice border is the kind of difference that's invisible in isolation but noisy when both are on the same page.
- **Fix sketch:** declare `--motion-fast: 100ms` and `--motion-slow: 200ms` at `:root`, retire the 120ms.

### I-6. Choice transitions ignore `prefers-reduced-motion`

- **Where:** `.choice`, `.next`, `.primary`, `.secondary`. Only `.pack-card`'s lift is gated.
- **Issue:** users who set `prefers-reduced-motion: reduce` still see the choice / CTA color transitions. Color-only transitions are usually safe (they're not "motion" per the spec), but the project has already committed to the pattern for `.pack-card` — the policy should be consistent.
- **Fix sketch:** decide whether color transitions count as motion in this codebase. If yes, gate all of them. If no, leave the choice/CTA transitions and document the policy at the top of each style block.

### I-7. No `:focus-visible` outline on any button, choice, or link except `.pack-card`

- **Where:** `.choice`, `.next`, `.primary`, `.secondary`, `.back`, `.brand`, `.github`.
- **Issue:** keyboard users see the browser-default focus ring on most controls — which is typically a thin blue dotted/solid outline on the rectangle. Against the navy `.question-card`, the default ring on `.choice` is hard to see.
- **Fix sketch:** declare a single `--focus-ring: 0 0 0 3px rgba(29, 78, 216, 0.45)` (or similar) and apply it via `:focus-visible` on all controls. Test on the navy card.

### I-8. Disabled state is invisible

- **Where:** `.choice:disabled` (`play/[pack]/+page.svelte:201-203`).
- **Issue:** the only `:disabled` declaration sets `cursor: default`. There is no opacity, color, or border change. After answering, the unanswered choices retain their default appearance, and pointer hovers no longer respond — a user who didn't notice the explanation panel may be confused about why nothing's happening.
- **Fix sketch:** add a muted-text variant for `.choice:disabled:not(.correct):not(.wrong)`, or surface a clearer "answered — read the explanation" affordance.

### I-9. Category pill uses an off-token blue

- **Where:** `.category` (`+page.svelte:215-219`) → background `#f0f9ff`, color `#1d4ed8`.
- **Issue:** the home page hasn't been rebranded to Arsenal, so this is technically expected, but it's worth queueing for the next palette pass since the same `#1d4ed8` accent appears in five other places (back link, focus ring, CTAs, etc.) — they should move together.
- **Fix sketch:** when the home page is rebranded, replace `#1d4ed8` with `var(--quiz-accent)` or a new `--quiz-link` token.

### I-10. Eight letter-spacing values across uppercase / display text

- **Where:** §2.2 lists all sites.
- **Issue:** uppercase mini-labels (`category`, `pack-title`, `result-label`, `new-pill`, `difficulty`) all chose their own letter-spacing in the 0.04–0.10em range.
- **Fix sketch:** pick one value for "uppercase mini-label" (0.06em is the most common) and one for "display heading tightening" (-0.02em on h1, -0.04em on the cover letter). Document and retire the rest.

### I-11. Result CTA pair mixes `<button>` and `<a>` without visually distinguishing them

- **Where:** result card actions (`play/[pack]/+page.svelte:113-115`).
- **Issue:** `.primary` is a button (resets quiz state), `.secondary` is a link (navigates home). They share padding, font, and radius — visually they're a pair — but the underlying element types differ. That's fine semantically, but the lack of any visual cue (icon, slightly different weight) means a screen-reader user is the only one who hears "button" vs "link".
- **Fix sketch:** add a small directional glyph (e.g. `→` on the link, none on the button), or accept the symmetry as deliberate and document it.

### I-12. Hardcoded "of 3" in difficulty ARIA label

- **Where:** `+page.svelte:67-68`.
- **Issue:** the visible stars adapt to the data; the ARIA label is a fixed string. If `Question.difficulty` widens past 3, the screen-reader announcement is wrong.
- **Fix sketch:** derive the max from a single `MAX_DIFFICULTY` constant exported from `packs.ts`, and have both the type and the ARIA label consume it.

### I-13. Nav GitHub link points at the wrong repo

- **Where:** `+layout.svelte:14`.
- **Issue:** see X-1.
- **Fix sketch:** update the href to `https://github.com/routeburn-alpha/product-demo`, or remove the link if it's not load-bearing.

### I-14. Vertical padding on `.container` (play) is asymmetric (1rem top, 3rem bottom)

- **Where:** `play/[pack]/+page.svelte:124`.
- **Issue:** no other container has asymmetric vertical padding. Likely a holdover from when the nav was taller. Looks slightly cramped above the progress row.
- **Fix sketch:** make the padding `2rem 1.5rem` (or `1.5rem` symmetric) and verify the progress row doesn't collide with the nav.

### I-15. Three different "card" padding conventions

- **Where:** see §2.3.
- **Issue:** the three cards in the app (`.pack-card .body`, `.question-card`, `.result-card`) all pick different paddings (`1rem 1.25rem 0.75rem`, `1.75rem`, `3rem 2rem`). The result card padding is appropriate for a hero summary, but the gap between 1rem (pack body) and 1.75rem (question card) is unmotivated.
- **Fix sketch:** define `--card-padding-sm: 1.25rem`, `--card-padding-md: 1.75rem`, `--card-padding-lg: 2.5rem` (or similar) and pick one per card.

### I-16. Hover and link color (`#1d4ed8`) appears in 10+ inline literals

- **Where:** see [`quiz-color-audit.md`](./quiz-color-audit.md).
- **Issue:** the most-repeated color in the app is also the one most likely to change in a future rebrand pass. Every change is a 10-site edit.
- **Fix sketch:** introduce `--color-accent` / `--color-accent-hover` (today `#1d4ed8` / `#1e40af`) at `:root`, migrate all sites. This was foreshadowed in the existing color audit's recommendation block.

---

## 5. Cross-cutting recommendations

These are not new issues; they're patterns that show up across the catalog. Useful as scoping notes when sequencing follow-ups.

1. **Introduce a neutral & accent token layer.** Today only Arsenal brand + `--text-muted` are tokenised. Adding `--color-bg`, `--color-surface`, `--color-border`, `--color-text-strong`, `--color-text-default`, `--color-accent`, `--color-accent-hover`, `--motion-fast`, `--motion-slow`, `--radius-control`, `--radius-card` at `:root` would resolve I-2, I-4, I-5, I-15, I-16 in a single self-contained change.
2. **Promote `body` to own the font stack** (resolves I-1, X-2) and add a paragraph on the type ramp in the style guide so future surfaces stop inventing new sizes.
3. **One focus-visible rule for all controls** (resolves I-7) — declared on a `.btn, .choice, a` selector list, or via a `:where()` rule for low specificity.
4. **Audit the home page against the style guide.** The style guide explicitly notes the pack picker still consumes the pre-Arsenal palette. I-9 and I-16 are downstream of that.
5. **Decide the motion policy.** I-5 + I-6 collapse once "color transitions are / are not motion" is written down.

---

## 6. What this audit intentionally does not cover

- **Mobile breakpoints below 375px.** The grid has a single `@media (max-width: 375px)` rule that collapses the pack grid to one column. Anything narrower than 375px is out of scope for v1.
- **Animation timing curves.** Every transition uses `ease`. There is no custom easing in the codebase, so there's nothing to audit yet.
- **Iconography.** Quiz Lab does not ship any SVG/font icons. The only glyphs in use are the ★ characters in the difficulty pills and the `←` / `→` arrows in nav links; both are inline characters, not assets.
- **Internationalization.** All copy is English; no localization layer exists.
- **Dark mode / theme switching.** Not in the codebase; not part of any current idea.
- **Screen-reader behavior beyond the ARIA-label issue called out in I-12.** A dedicated a11y pass should be filed separately; this audit only flagged a11y issues that surfaced incidentally.
- **Screenshots.** This environment provides no browser tooling, so visual references in §1 are textual sketches. A follow-up that runs the dev server and captures PNGs of each surface would slot directly into §1 without re-structuring the document.
