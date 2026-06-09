# Ski Slopes Quiz — Question Design

Design spec for **Idea #9 / Task #49**: the question formats, categories, difficulty
progression, and scoring approach for the `ski-slopes` pack. This is the plan the
content task (#123, `ski-slopes.json`) should build against.

**Hard constraint:** everything below lives inside the existing `Pack` / `Question`
schema in `app/src/lib/packs.ts`. The renderer only supports **one physical format** —
a prompt with **exactly four text choices**, one `correctIndex`, a `difficulty` of
1–3, and an `explanation`. There is no image, true/false, or map widget. So the
"distinct formats" the task calls for are authored as **question *styles*** that all
compile down to 4-choice multiple choice.

---

## 1. Question styles (4–5 formats, all rendered as 4-choice MC)

| # | Style | How it maps to 4 choices | Example prompt shape |
|---|-------|--------------------------|----------------------|
| 1 | **Direct factual** | 4 candidate answers, 1 correct | "Which resort hosts the annual Hahnenkamm downhill?" |
| 2 | **Description → identification** (photo stand-in) | Prompt paints the distinctive visual/terrain features in words; choices are 4 resort names | "Famous for a treeless, glacier-fed bowl and a tram to 11,000 ft, this resort is…" |
| 3 | **Geographic matching** (map stand-in) | "Where is X?" — choices are 4 countries/regions/ranges | "In which mountain range is Chamonix located?" |
| 4 | **Superlative / ranking** | A "which has the most/highest/longest" question; choices are 4 resorts or 4 numeric values | "Which has the greatest lift-served vertical drop?" |
| 5 | **Statement validation** (true/false stand-in) | 4 statements, exactly one is true (or one false — keep it consistent within a question) | "Which statement about Epic Pass is correct?" |

> **Why not literal true/false / photos / maps?** Those would require new
> `Question` variants and renderer changes — explicitly out of scope for this
> direction. Styles 2, 3, and 5 deliver the *experience* of those formats while
> staying one-JSON-file and schema-clean. If we later extend the schema, these
> styles are the natural seams to upgrade (a description question becomes a real
> photo question; a geographic-matching question gains a map).

**Authoring rules so styles stay fair as 4-choice MC:**
- All 4 choices must be the same *kind* of thing (4 resorts, or 4 countries, or 4
  numbers) — never mix.
- Distractors must be plausible and non-trivially eliminable (real resorts/regions,
  numbers within a believable range).
- For style 5, the three wrong statements must be unambiguously false, not "mostly
  true" — avoid the over-engineered, debatable prompts.

---

## 2. Categories

Four content categories, drawn from the task spec and the idea's content strategy.
Each maps to an `id` topic segment (the test suite derives topic from
`q.id.split('-')[1]`, so the segment matters):

| Category | `id` segment | Covers |
|----------|-------------|--------|
| Geography & location | `geo` | Country/range/continent, alpine regions, where resorts sit |
| Slope characteristics | `slope` | Vertical drop, elevation, run difficulty (green/blue/black), piste naming |
| Resort features | `resort` | Epic Pass membership, terrain parks, glaciers, trams, signature runs |
| Skiing culture & history | `cult` | Technique/equipment, Olympic venues, competition history, traditions |

Example id: `ski-geo-1`, `ski-slope-2`, `ski-resort-3`, `ski-cult-1`.

**Content-mix target (from the idea), expressed over the question set:**
- ~40% Epic Pass resorts (Vail, Whistler, Park City, Heavenly, Stowe…) — mostly
  `resort`, some `geo`/`slope`.
- ~35% other major destinations (Chamonix, St. Moritz, Aspen, Jackson Hole).
- ~25% culture & geography fundamentals (`cult`, `geo`).

---

## 3. Difficulty progression

`difficulty` is **display + ordering metadata only** — the home page shows a pack's
difficulty *range* (`min–max`), and the runtime plays questions in **array order**.
It does **not** affect scoring (see §4). So "progression" is delivered by **ordering
the `questions` array ascending by difficulty** — easy questions first, expert last —
so a player ramps up.

**Target: 12 questions, distribution 4 / 5 / 3.**

| Difficulty | Label | Count | Character |
|-----------|-------|-------|-----------|
| 1 | Beginner | 4 | Globally famous facts (Aspen is in Colorado; the Alps span France/Switzerland) |
| 2 | Intermediate | 5 | Rewards a regular skier (which resorts are on Epic Pass; Chamonix sits under Mont Blanc) |
| 3 | Expert | 3 | Specific numbers, niche history (exact vertical drops, Hahnenkamm/Olympic trivia) |

Spread the four categories across all three difficulty bands — don't let any one
category be all-easy or all-hard.

---

## 4. Scoring criteria

The renderer (`play/[pack]/+page.svelte`) scores **one point per correct answer,
all questions weighted equally** — difficulty does *not* change a question's value.
Final score is `correct / total`, surfaced through three result tiers:

| Tier | Threshold (of total) | UX intent |
|------|----------------------|-----------|
| Perfect | 100% | Celebrate |
| Strong | ≥ 70% | Positive |
| Mixed | ≥ 40% | Encouraging |
| Low | < 40% | Try again |

**Design implications for a 12-question pack:**
- Tier boundaries land at **12/12 (perfect)**, **≥9 (strong)**, **≥5 (mixed)**.
- Because scoring is flat, the **4/5/3** difficulty split *is* the difficulty knob:
  a player who only knows the basics nets ~4 (Low), a solid skier ~9 (Strong), and
  perfect requires the expert tier. This is how we tune challenge without weighted
  scoring.
- Keep exactly one defensible correct answer per question — flat scoring means an
  ambiguous question silently costs a full point with no partial credit.

---

## 5. Pack metadata (for #123)

Per the idea's technical design, and verified unique against existing packs
(no pack uses this `coverColor`/`coverEmoji` combo — required by `packs.test.ts`):

```json
{
  "id": "ski-slopes",
  "title": "World's Best Ski Slopes",
  "category": "Sports",
  "description": "Test your knowledge of epic ski destinations worldwide",
  "coverColor": "#2563eb",
  "coverEmoji": "🎿",
  "addedAt": "<YYYY-MM-DD at PR time>"
}
```

## 6. Build checklist for the content task (#123)

- [ ] 12 questions, ids `ski-<geo|slope|resort|cult>-<n>`.
- [ ] Difficulty counts exactly **4 / 5 / 3**; array ordered ascending by difficulty.
- [ ] Each category appears across ≥2 difficulty bands.
- [ ] Every question is 4 same-kind choices, one correct, plausible distractors.
- [ ] Each `explanation` cites a source, matching the house style of existing packs.
- [ ] `npm run check` and `npm run test` pass (validates schema + cover uniqueness).
