# Quiz color contrast audit (WCAG AA)

Companion to [quiz-color-audit.md](./quiz-color-audit.md). Verifies every text and meaningful non-text color pair currently in the quiz UI against the WCAG AA contrast thresholds, captures pass/fail per element, and lists the small set of failures with recommended fixes.

This document is the deliverable for **idea #1 / task #7** (Conduct accessibility testing for color contrast).

## Scope

State of the code at HEAD (after PRs #2–#5 landed, with the Arsenal Navy + Arsenal Red palette applied):

- `app/src/routes/+layout.svelte` — nav chrome, body, palette tokens at `:root`.
- `app/src/routes/+page.svelte` — pack picker home.
- `app/src/routes/play/[pack]/+page.svelte` — quiz play view.

## Methodology

- **Relative luminance** computed per [WCAG 2.1 §3.3](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance): channels are sRGB-decoded with the piecewise transform (linear for ≤ 0.03928, `((c + 0.055)/1.055)^2.4` otherwise), then mixed `0.2126·R + 0.7152·G + 0.0722·B`.
- **Contrast ratio** = `(L_lighter + 0.05) / (L_darker + 0.05)`.
- **WCAG AA thresholds:**
  - Normal text: **4.5 : 1**
  - Large text (≥ 18pt regular **or** ≥ 14pt bold ≈ ≥ 24px regular / ≥ 18.66px bold): **3 : 1**
  - Non-text UI components & graphical objects (WCAG 2.1 SC 1.4.11): **3 : 1**
- **Letter-badge sizing note:** as of task #32, `.letter` uses `font-size: 1.2rem` (~19.2px) with `font-weight: 700`. WCAG defines "bold large text" as ≥ 14pt (~18.66px), so the badge text qualifies as **large text** and the **3 : 1** threshold applies. (Before task #32 it was 0.8rem / ~12.8px, which was normal text — and is the reason the letter-badge rows previously failed; see Failure summary.)
- **What was not tested here:** color vision deficiency (CVD) simulation in a real screen-reader environment. Sim-only checks below give a representative read; an in-browser CVD pass (e.g. Chrome DevTools "Emulate vision deficiencies" with deuteranopia, protanopia, tritanopia, achromatopsia) is recommended before any production sign-off. See follow-ups.

## Palette tokens in play

| Token | Hex | sRGB | Relative luminance |
|---|---|---|---|
| `--arsenal-navy` / `--quiz-primary` | `#023474` | (2, 52, 116) | 0.0343 |
| `--arsenal-red` / `--quiz-danger` | `#EF0107` | (239, 1, 7) | 0.1839 |
| `--arsenal-gold` / `--quiz-accent` | `#9C824A` | (156, 130, 74) | 0.2378 |
| `--arsenal-white` / `--quiz-on-primary` | `#FFFFFF` | (255, 255, 255) | 1.0000 |

Plus legacy values still present in the stylesheets: `#111`, `#222`, `#555`, `#666`, `#888` (grays); `#fafafa`, `#fff`, `#f5f5f5`, `#f5f9ff`, `#f0f9ff`, `#f0fdf4`, `#fef2f2` (surfaces); `#14532d`, `#16a34a` (greens); `#7f1d1d`, `#dc2626` (reds, though `#dc2626` is now unused after task #6); `#1d4ed8`, `#1e40af` (blues).

## Results — quiz play view (`/play/[pack]`)

### Question card (the "primary quiz box")

| Element | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `.prompt` (1.25rem / 600) | `#FFFFFF` | `#023474` | **12.46 : 1** | AA normal 4.5 | ✓ |
| `.question-card` border | `#e2e2e2` | `#023474` | 9.93 : 1 | non-text 3 | ✓ |

### Answer choices (`.choice`)

| State | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| default text | `#222` | `#FFFFFF` | **15.90 : 1** | AA normal 4.5 | ✓ |
| default border | `#e2e2e2` | `#FFFFFF` | 1.31 : 1 | non-text 3 | ✗ *see note* |
| default border | `#e2e2e2` | `#023474` (card padding) | 9.93 : 1 | non-text 3 | ✓ |
| hover border | `#1d4ed8` | `#FFFFFF` | 6.70 : 1 | non-text 3 | ✓ |
| `.correct` text | `#14532d` | `#f0fdf4` | **8.70 : 1** | AA normal 4.5 | ✓ |
| `.correct` border | `#16a34a` | `#FFFFFF` | 2.83 : 1 | non-text 3 | ⚠ marginal |
| `.wrong` text | `#7f1d1d` | `#fef2f2` | **9.16 : 1** | AA normal 4.5 | ✓ |
| `.wrong` border | `#EF0107` | `#FFFFFF` | 4.00 : 1 | non-text 3 | ✓ |

**Note on the default `.choice` border:** the white-on-white edge fails 3 : 1 when read against the button's own background, but the button sits on a navy card, so the user perceives the border as separating the white button from the navy fill — at which point the 9.93 : 1 figure governs. No functional accessibility issue.

### Letter badges (`.letter`, 1.2rem / 700, ~19.2px — large text per WCAG)

| State | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| default | `#555` | `#f5f5f5` | 6.86 : 1 | AA large 3 | ✓ |
| `.correct` | `#FFFFFF` | `#16a34a` | 3.30 : 1 | AA large 3 | ✓ |
| `.wrong` | `#FFFFFF` | `#EF0107` | 4.49 : 1 | AA large 3 | ✓ |

### Feedback panels (`.explanation`)

| State | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `.correct` | `#14532d` | `#f0fdf4` | 8.70 : 1 | AA normal 4.5 | ✓ |
| `.wrong` | `#7f1d1d` | `#fef2f2` | 9.16 : 1 | AA normal 4.5 | ✓ |

### CTAs and chrome

| Element | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `.next` button | `#FFFFFF` | `#1d4ed8` | 6.70 : 1 | AA normal 4.5 | ✓ |
| `.back` link | `#1d4ed8` | `#fafafa` | 6.42 : 1 | AA normal 4.5 | ✓ |
| `.progress` (0.85rem / regular) | `#737373` (`--text-muted`) | `#fafafa` | 4.59 : 1 | AA normal 4.5 | ✓ |
| `.pack-title` (1rem / 600, uppercase) | `#737373` (`--text-muted`) | `#fafafa` | 4.59 : 1 | AA normal 4.5 | ✓ |

### Result card

| Element | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `.result-label` (0.9rem / 600) | `#737373` (`--text-muted`) | `#FFFFFF` | 4.74 : 1 | AA normal 4.5 | ✓ |
| `.result-score` (4rem / 800) | `#1d4ed8` | `#FFFFFF` | 6.70 : 1 | AA large 3 | ✓ |
| `.result-score .of` (2rem / 400) | `#737373` (`--text-muted`) | `#FFFFFF` | 4.74 : 1 | AA large 3 | ✓ |
| `.result-summary` (1rem) | `#555` | `#FFFFFF` | 7.46 : 1 | AA normal 4.5 | ✓ |
| `.primary` button | `#FFFFFF` | `#1d4ed8` | 6.70 : 1 | AA normal 4.5 | ✓ |
| `.secondary` button | `#1d4ed8` | `#FFFFFF` | 6.70 : 1 | AA normal 4.5 | ✓ |

## Results — home (`/`)

| Element | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `h1` "Quiz Lab" | `#111` | `#fafafa` | 18.10 : 1 | AA large 3 | ✓ |
| `.subtitle` | `#555` | `#fafafa` | 7.14 : 1 | AA normal 4.5 | ✓ |
| pack card title `h2` | `#111` | `#FFFFFF` | 18.88 : 1 | AA normal 4.5 | ✓ |
| `.category` pill | `#1d4ed8` | `#f0f9ff` | ~6.30 : 1 | AA normal 4.5 | ✓ |
| `.description` | `#555` | `#FFFFFF` | 7.46 : 1 | AA normal 4.5 | ✓ |
| `.meta` (0.85rem) | `#737373` (`--text-muted`) | `#FFFFFF` | 4.74 : 1 | AA normal 4.5 | ✓ |
| `.play` "Play →" | `#1d4ed8` | `#FFFFFF` | 6.70 : 1 | AA normal 4.5 | ✓ |
| footer | `#666` | `#fafafa` | 5.50 : 1 | AA normal 4.5 | ✓ |

## Results — nav chrome (`+layout.svelte`)

| Element | Foreground | Background | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| `.brand` | `#111` | `#fafafa` | 18.10 : 1 | AA normal | ✓ |
| `.github` | `#666` | `#fafafa` | 5.50 : 1 | AA normal | ✓ |

## Failure summary

**Zero failures.** Every text and meaningful non-text color pair in the quiz UI passes WCAG AA at HEAD.

### Resolved (history)

- ~~**`.choice.wrong .letter`** — `#FFFFFF` on Arsenal Red was 4.49 : 1 at the old 0.8rem badge size (normal text, 4.5 : 1 threshold). Fixed in **task #32** by bumping the badge to 1.2rem / 700, which qualifies as large text (3 : 1 threshold) — now passes at 4.49 : 1.~~
- ~~**`.choice.correct .letter`** — `#FFFFFF` on `#16a34a` was 3.30 : 1, also fixed by task #32.~~
- ~~**`.progress`, `.pack-title`, `.result-label`, `.result-score .of`, `.meta`** — all were `#888` on light surfaces (3.40–3.55 : 1). Fixed in **task #33** by introducing `--text-muted: #737373`, which clears 4.5 : 1 on both `#fafafa` (4.59 : 1) and `#FFFFFF` (4.74 : 1).~~

## CVD considerations (not yet exercised)

The Arsenal palette plus the existing green/red semantic accents form three coupled risk areas for deuteranopia and protanopia:

- **Wrong (Arsenal Red, `#EF0107`) vs. Correct (`#16a34a`)** on the letter badge — in deuteranopia they collapse toward yellow/brown. The text on the choice (✓ "Correct!" / "Not quite.") and the explanation panel copy carry the semantics in writing, so users don't depend on color alone, but the badges become much less differentiated. Recommend: add a small icon (✓/✕) inside the letter badge for the answered states.
- **Arsenal Red CTA (none yet)** — not a concern in the current code since CTAs remain blue; revisit if a future task swaps CTAs to red.
- **Achromatopsia (monochrome)** — every state currently reads in pure grayscale because we always pair color with a text label or a clear background tint difference. No action.

In-browser CVD simulation should be run as part of the follow-up `--text-muted` cleanup (task #33) or as its own task.

## Conclusion

**The quiz UI is fully clean under WCAG AA as of task #33.** The primary quiz box passes by a wide margin (white on Arsenal Navy = 12.5 : 1), letter badges pass at the large-text threshold, and all secondary labels now consume `--text-muted` and pass AA normal.

Remaining accessibility work for idea #1 is no longer about contrast — it lives in the **CVD considerations** section above (icon affordance on the letter badges) and in a screen-reader walkthrough, neither of which is in any open task. Both are worth filing if idea #1 is being promoted to "All Customers".
