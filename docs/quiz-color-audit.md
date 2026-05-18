# Quiz color audit

Inventory of every quiz-related UI element, where it lives, and the color values it currently uses. This is the baseline for [idea #1 — Change Quiz Box Colors](../README.md) (Arsenal FC brand palette: Arsenal Navy `#023474`, Arsenal Red `#EF0107`).

## Architecture notes

- The app is SvelteKit (Svelte 5). There are **no shared components** for quiz UI — every quiz element is inline markup with scoped `<style>` blocks in two route files.
- There is **no design-token system** — no CSS custom properties, no Tailwind, no theme file. Every color is a hex literal repeated at each use site.
- No global stylesheet (`app.css`) exists. The only global rule is `body { background: #fafafa }` in `+layout.svelte`.

Practical consequence for the upcoming rework: each color change must be made at every literal site, or a CSS-variables layer must be introduced first.

## Files in scope

| File | Role |
| --- | --- |
| `app/src/routes/+layout.svelte` | Top nav, body background |
| `app/src/routes/+page.svelte` | Home — pack picker grid |
| `app/src/routes/play/[pack]/+page.svelte` | Quiz play view — question card, choices, explanations, result card |

## Color inventory by element

### 1. Pack picker — `app/src/routes/+page.svelte`

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Page heading "Quiz Lab" | `h1` | `color` | `#111` | 56 |
| Subtitle | `.subtitle` | `color` | `#555` | 62 |
| Pack card | `.pack-card` | `border` | `#e2e2e2` | 78 |
| Pack card | `.pack-card` | `background` | `#fff` | 81 |
| Pack card hover | `.pack-card:hover` | `border-color` | `#1d4ed8` | 88 |
| Pack card hover | `.pack-card:hover` | `box-shadow` | `rgba(29, 78, 216, 0.08)` | 90 |
| Pack title | `h2` | `color` | `#111` | 103 |
| Category pill | `.category` | `background` | `#f0f9ff` | 114 |
| Category pill | `.category` | `color` | `#1d4ed8` | 115 |
| Pack description | `.description` | `color` | `#555` | 120 |
| Meta row | `.meta` | `color` | `#888` | 132 |
| "Play →" link | `.play` | `color` | `#1d4ed8` | 136 |
| Footer divider | `footer` | `border-top` | `#e2e2e2` | 143 |
| Footer text | `footer` | `color` | `#666` | 144 |
| Inline `<code>` | `code` | `background` | `#f5f5f5` | 151 |

### 2. Quiz play view — `app/src/routes/play/[pack]/+page.svelte`

#### Header / progress

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Back link "← All packs" | `.back` | `color` | `#1d4ed8` | 124 |
| Progress counter | `.progress` | `color` | `#888` | 134 |
| Pack title (uppercase label) | `.pack-title` | `color` | `#888` | 140 |

#### Question card (the primary "quiz box")

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Question card container | `.question-card` | `background` | `#fff` | 147 |
| Question card container | `.question-card` | `border` | `#e2e2e2` | 148 |
| Question prompt | `.prompt` | `color` | `#111` | 156 |

#### Answer choices (buttons)

| Element / state | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Default border | `.choice` | `border` | `#e2e2e2` | 173 |
| Default background | `.choice` | `background` | `#fff` | 175 |
| Default text | `.choice` | `color` | `#222` | 178 |
| Hover border | `.choice:hover` | `border-color` | `#1d4ed8` | 184 |
| Hover background | `.choice:hover` | `background` | `#f5f9ff` | 185 |
| **Correct** border | `.choice.correct` | `border-color` | `#16a34a` | 193 |
| **Correct** background | `.choice.correct` | `background` | `#f0fdf4` | 194 |
| **Correct** text | `.choice.correct` | `color` | `#14532d` | 195 |
| **Wrong** border | `.choice.wrong` | `border-color` | `#dc2626` | 199 |
| **Wrong** background | `.choice.wrong` | `background` | `#fef2f2` | 200 |
| **Wrong** text | `.choice.wrong` | `color` | `#7f1d1d` | 201 |
| Letter badge default | `.letter` | `background` | `#f5f5f5` | 211 |
| Letter badge default | `.letter` | `color` | `#555` | 214 |
| Letter badge correct | `.choice.correct .letter` | `background` | `#16a34a` | 219 |
| Letter badge correct | `.choice.correct .letter` | `color` | `#fff` | 220 |
| Letter badge wrong | `.choice.wrong .letter` | `background` | `#dc2626` | 224 |
| Letter badge wrong | `.choice.wrong .letter` | `color` | `#fff` | 225 |

#### Explanation panel (feedback)

| Element / state | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Correct background | `.explanation.correct` | `background` | `#f0fdf4` | 241 |
| Correct text | `.explanation.correct` | `color` | `#14532d` | 242 |
| Wrong background | `.explanation.wrong` | `background` | `#fef2f2` | 246 |
| Wrong text | `.explanation.wrong` | `color` | `#7f1d1d` | 247 |

#### Next-question button

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Background | `.next` | `background` | `#1d4ed8` | 257 |
| Text | `.next` | `color` | `#fff` | 258 |
| Hover background | `.next:hover` | `background` | `#1e40af` | 266 |

#### Result card (post-quiz)

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Card background | `.result-card` | `background` | `#fff` | 271 |
| Card border | `.result-card` | `border` | `#e2e2e2` | 272 |
| "You scored" label | `.result-label` | `color` | `#888` | 279 |
| Score number | `.result-score` | `color` | `#1d4ed8` | 290 |
| Score "/ N" suffix | `.result-score .of` | `color` | `#888` | 296 |
| Result summary text | `.result-summary` | `color` | `#555` | 302 |
| Primary CTA background | `.primary` | `background` | `#1d4ed8` | 328 |
| Primary CTA text | `.primary` | `color` | `#fff` | 329 |
| Primary CTA hover | `.primary:hover` | `background` | `#1e40af` | 334 |
| Secondary CTA background | `.secondary` | `background` | `#fff` | 338 |
| Secondary CTA text | `.secondary` | `color` | `#1d4ed8` | 339 |
| Secondary CTA border | `.secondary` | `border` | `#1d4ed8` | 340 |
| Secondary CTA hover | `.secondary:hover` | `background` | `#f5f9ff` | 344 |

### 3. Chrome — `app/src/routes/+layout.svelte`

| Element | Selector | Property | Value | Line |
| --- | --- | --- | --- | --- |
| Body background | `body` (global) | `background` | `#fafafa` | 22 |
| Brand "Quiz Lab" | `.brand` | `color` | `#111` | 38 |
| GitHub link | `.github` | `color` | `#666` | 45 |
| GitHub link hover | `.github:hover` | `color` | `#1d4ed8` | 50 |

## Aggregated palette in use today

| Hex | Role | Occurrences |
| --- | --- | --- |
| `#1d4ed8` (blue-700) | Primary accent — links, CTAs, focus border, category pill, score | 12 |
| `#1e40af` (blue-800) | Primary CTA hover | 2 |
| `#f0f9ff` (sky-50) | Category pill background | 1 |
| `#f5f9ff` (custom blue-50) | Hover background — choices, secondary CTA | 2 |
| `rgba(29, 78, 216, 0.08)` | Pack card hover shadow | 1 |
| `#16a34a` (green-600) | Correct border + letter badge | 2 |
| `#f0fdf4` (green-50) | Correct background — choice + explanation | 2 |
| `#14532d` (green-900) | Correct text | 2 |
| `#dc2626` (red-600) | Wrong border + letter badge | 2 |
| `#fef2f2` (red-50) | Wrong background — choice + explanation | 2 |
| `#7f1d1d` (red-900) | Wrong text | 2 |
| `#fff` | Card / button background | 7 |
| `#fafafa` | Page background | 1 |
| `#f5f5f5` | Letter badge default, `<code>` background | 2 |
| `#e2e2e2` | All borders / dividers | 5 |
| `#111` | Primary text — h1/h2/prompt/brand | 4 |
| `#222` | Choice text | 1 |
| `#555` | Body copy — subtitles, descriptions, result summary, letter badge | 5 |
| `#666` | Footer + nav secondary text | 2 |
| `#888` | Tertiary labels — progress, meta, result label | 5 |

## Components that need updates (per idea #1 acceptance)

- **Question boxes** — `.question-card` in `app/src/routes/play/[pack]/+page.svelte:146-159`
- **Answer options** — `.choice` and its state modifiers (`.selected`, `.correct`, `.wrong`) plus nested `.letter` in `app/src/routes/play/[pack]/+page.svelte:167-230`
- **Feedback / explanation sections** — `.explanation` and state modifiers in `app/src/routes/play/[pack]/+page.svelte:232-248`
- **Progress indicators** — `.progress-row`, `.progress`, `.pack-title` (uppercase label above the card) in `app/src/routes/play/[pack]/+page.svelte:115-144`
- **Result card** — `.result-card`, `.result-score`, `.primary`, `.secondary` in `app/src/routes/play/[pack]/+page.svelte:269-345`
- **Pack picker cards** — `.pack-card`, `.category`, `.play` in `app/src/routes/+page.svelte:74-138` (carry the same blue accent; in scope if the rebrand should be consistent app-wide)
- **Nav chrome** — `.github:hover` and body background in `app/src/routes/+layout.svelte:20-51` (same caveat)

## Recommendation for the rework

Before changing values one-by-one, introduce a CSS custom-property layer (either a small `:root` block in `+layout.svelte` or a new `app/src/app.css`). Concretely, today's palette collapses to roughly: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-hover`, `--color-accent-soft`, `--color-success-*`, `--color-error-*`. With those in place the Arsenal-palette swap becomes a single-file edit and the audit table above doubles as a regression checklist.
