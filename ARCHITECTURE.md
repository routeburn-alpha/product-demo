# Quiz Lab — Architecture

The implementation-level walkthrough of Quiz Lab — every route, the data flow at build time vs.
runtime, the deployment pipelines, and the studio-ai integration.

---

## 1. What this app is

**Quiz Lab** is a static, prerendered trivia web app. Players pick a *pack* (a themed set of
multiple-choice questions), answer one question at a time, see an explanation after each answer,
and get a score at the end. There is **no backend, no database, and no server runtime** — the
entire site is built into static HTML/JS/CSS and served from GitHub Pages.

Its real purpose is to be a **demo vehicle for the studio-ai workflow**: idea → task → branch →
PR → preview → production. Because "adding content" is just "add one JSON file + open a PR,"
the content loop is trivially parallelizable across multiple agents and shows the full pipeline
end-to-end.

---

## 2. Tech stack

| Layer            | Technology                                              | Notes |
|------------------|---------------------------------------------------------|-------|
| Framework        | SvelteKit 2 (`@sveltejs/kit ^2.57`)                     | App Router-style file routing |
| UI library       | Svelte 5 (`^5.55`), **runes mode forced**               | `$props`, `$state`, `$derived` |
| Language         | TypeScript 6 (strict), `checkJs` on                     | JS config files type-checked too |
| Build tool       | Vite 8                                                   | via `@sveltejs/vite-plugin-svelte` |
| Adapter          | `@sveltejs/adapter-static ^3`                            | Full prerender → static files |
| Tests            | Vitest 4                                                | `app/src/lib/packs.test.ts` |
| Type checking    | `svelte-check`                                          | `npm run check` |
| Hosting          | GitHub Pages                                            | production + per-PR previews |
| CI/CD            | GitHub Actions                                          | `deploy.yml`, `preview.yml` |
| Task management  | studio-ai MCP server (`.mcp.json`)                      | agents pick up tasks against the repo |

The app lives entirely inside the [`app/`](./app) subdirectory. The repo root holds docs,
CI workflows, the MCP config, and the `.studio/` skills.

---

## 3. Repository layout

```
product-demo/
├── ARCHITECTURE.md                # ← you are here
├── README.md  VISION.md  ONBOARDING.md
├── docs/                          # UI / color audits + style guides
│   ├── quiz-color-audit.md
│   ├── quiz-color-contrast.md
│   ├── quiz-color-style-guide.md
│   └── ui-audit.md
├── .github/workflows/
│   ├── deploy.yml                 # main → GitHub Pages (production)
│   └── preview.yml                # PR → /pr-<n>/ preview + cleanup on close
├── .mcp.json.example              # studio-ai MCP wiring template (copy → .mcp.json)
├── .studio/skills/                # customer-owned skills the platform agent loads
│   ├── bootstrap/SKILL.md
│   ├── verify/SKILL.md
│   └── quiz-content-conventions/SKILL.md
└── app/                           # the SvelteKit application
    ├── package.json  svelte.config.js  vite.config.ts  tsconfig.json
    ├── src/
    │   ├── app.html               # HTML shell (%sveltekit.head% / %sveltekit.body%)
    │   ├── app.d.ts               # ambient App.* types (empty placeholders)
    │   ├── routes/
    │   │   ├── +layout.svelte     # top nav + global CSS tokens
    │   │   ├── +layout.ts         # prerender = true (applies site-wide)
    │   │   ├── +page.svelte       # home: pack picker grid
    │   │   ├── +page.server.ts    # load(): listPacks()
    │   │   └── play/[pack]/
    │   │       ├── +page.svelte   # play screen + scoring state machine
    │   │       └── +page.server.ts# load(): getPack(); entries() for prerender
    │   └── lib/
    │       ├── packs.ts           # types (Pack, Question) + filesystem loaders
    │       ├── packs.test.ts      # Vitest coverage of the loaders
    │       ├── index.ts           # $lib barrel (placeholder)
    │       ├── assets/favicon.svg
    │       └── data/packs/        # ← all content: one JSON file per pack
    │           ├── british-food.json
    │           ├── cuisines.json
    │           ├── nyt-easy.json
    │           ├── premier-league.json
    │           └── san-francisco.json
    └── static/robots.txt
```

---

## 4. Routing & rendering

SvelteKit file-based routing defines exactly two pages:

| Route             | File                                  | Purpose |
|-------------------|---------------------------------------|---------|
| `/`               | `routes/+page.svelte`                 | Pack picker (grid of cards) |
| `/play/[pack]`    | `routes/play/[pack]/+page.svelte`     | Play a single pack |

Both are wrapped by `routes/+layout.svelte` (top nav + global CSS custom properties).

### Everything is prerendered

`routes/+layout.ts` exports `prerender = true`, which cascades to the whole site. At build time:

1. SvelteKit crawls from `/`.
2. For the dynamic `/play/[pack]` route, it cannot guess the slugs, so
   `play/[pack]/+page.server.ts` exports an **`entries()`** function that returns one entry per
   pack (`listPacks().map(p => ({ pack: p.id }))`). SvelteKit prerenders a static page for each.
3. `adapter-static` emits the result to `app/build/` as plain HTML + hashed JS/CSS assets.
4. `fallback: '404.html'` provides a client-side fallback page; `strict: true` fails the build
   if any reachable route can't be prerendered.

The net effect: **the filesystem reads in `packs.ts` only ever run at build time.** The shipped
site is pure static files — `fs`/`path` never run in the browser.

### `base` path handling

`svelte.config.js` reads `paths.base` from the `BASE_PATH` env var. GitHub Pages serves the site
under a subpath (`/<repo>/` for production, `/<repo>/pr-<n>/` for previews), so the CI workflows
set `BASE_PATH` accordingly at build time. In components, links are prefixed with the imported
`base` (e.g. `href="{base}/play/{pack.id}"`) so they resolve correctly under any subpath.

---

## 5. Data model

Defined in `app/src/lib/packs.ts`:

```ts
type Question = {
  id: string;                            // unique within the pack, e.g. "pl-1"
  prompt: string;
  choices: [string, string, string, string]; // exactly 4
  correctIndex: 0 | 1 | 2 | 3;
  difficulty: 1 | 2 | 3;                 // type allows 1–3; content skill uses a 1–5 scale
  explanation: string;                   // shown after answering, often with a source citation
};

type Pack = {
  id: string;            // URL slug == JSON filename stem, e.g. "premier-league"
  title: string;         // "Premier League Trivia"
  category: string;      // "Sports", "Food", "Word play", ...
  description: string;   // one-liner on the pack card
  coverColor?: string;   // optional card cover background
  coverEmoji?: string;   // optional cover glyph (falls back to first letter of title)
  tags?: string[];       // optional
  addedAt?: string;      // ISO date → drives the "New" pill (14-day window)
  questions: Question[]; // ordered, played in sequence
};
```

> Note: the `Question.difficulty` *type* is `1 | 2 | 3`, while the
> `quiz-content-conventions` skill documents a 1–5 scale. The skill is the authoritative
> content rule; the type is currently the narrower of the two.

### Content == files

Each pack is one JSON file in `app/src/lib/data/packs/`. The filename stem **is** the pack `id`
and the URL slug. Adding a pack is a single file addition; editing one is a single file change.
There is no migration, no schema registry, no seeding script — the directory listing *is* the
catalog. This is the deliberate design choice that makes content work parallelizable and
merge-conflict-free across agents.

Authoring rules (id format, exactly-4-choices, the "copy a question but forget to update
`correctIndex`" trap, explanation voice, difficulty calibration) live in
[`.studio/skills/quiz-content-conventions/SKILL.md`](./.studio/skills/quiz-content-conventions/SKILL.md).

---

## 6. The pack loader (`lib/packs.ts`)

A tiny module with two pure functions over the filesystem, plus the type definitions:

- **`listPacks(): Pack[]`** — reads every `*.json` in `PACKS_DIR`, parses each, and returns them
  sorted by `title` (locale-aware). Used by the home page loader and by `entries()`.
- **`getPack(id): Pack | null`** — reads `<id>.json`; returns `null` on any read/parse failure
  (the play route turns that `null` into a 404).

`PACKS_DIR` is `resolve('src/lib/data/packs')` — relative to the working directory at build time.
Because all rendering is prerendered, these synchronous `readFileSync`/`readdirSync` calls are
fine: they run once during `vite build`, never in a request path.

---

## 7. Data flow

### Build time (the only time server code runs)

```
vite build
   │
   ├─ crawl '/'  ─────────────► +page.server.ts.load()  ─► listPacks() ─► read *.json
   │                                                                         │
   │                                                            +page.svelte renders grid → /index.html
   │
   └─ entries() ─► [{pack:"cuisines"}, {pack:"nyt-easy"}, ...]
            │
            └─ for each: play/[pack]/+page.server.ts.load() ─► getPack(id) ─► read <id>.json
                                                                                 │
                                                  play/[pack]/+page.svelte ─► /play/<id>/index.html
```

Output lands in `app/build/`, ready to upload as a static artifact.

### Runtime (browser only)

```
User loads static page
   │
   ├─ Home: clicks a pack card  ──► client-side nav to /play/<id> (preloaded on hover via
   │                                  data-sveltekit-preload-data="hover")
   │
   └─ Play: all quiz logic is local Svelte 5 runes state — no network calls
```

---

## 8. The play screen state machine

`play/[pack]/+page.svelte` is the only stateful UI. It runs a small client-side state machine
using Svelte 5 runes — no store, no server round-trips:

| Rune state    | Meaning |
|---------------|---------|
| `index`       | current question index |
| `selected`    | the choice the player tapped for this question (`null` until they answer) |
| `answers`     | array of chosen indices, one per answered question |
| `finished`    | whether the round is over |

Derived values: `question` (current), `isCorrect`, and `score` (recomputed from `answers` vs.
each question's `correctIndex`).

Flow:

1. **Answer** — `choose(i)` locks in `selected` (ignored once a choice exists, so you can't
   change your answer). The chosen + correct choices light up green/red, and the explanation
   panel appears.
2. **Advance** — `next()` pushes `selected` into `answers`, then either advances `index` (and
   clears `selected`) or sets `finished = true` on the last question.
3. **Results** — a score card with a tiered message (perfect / ≥70% / ≥40% / below), plus
   **Play again** (`restart()` resets all state) and **Pick another pack**.
4. **Empty pack** — if `pack.questions.length === 0`, a "Coming soon" card renders instead.
   This lets a pack be merged as a stub before its questions land.

Because nothing is persisted, refreshing the page restarts the round — scores and feedback
persistence are intentionally out of scope for v1 (see §11).

---

## 9. Styling & theming

- **Global tokens** are declared in `+layout.svelte` under `:global(:root)`. The palette is
  built on raw Arsenal FC brand colors (`--arsenal-navy/red/gold/white`) aliased to semantic
  `--quiz-*` tokens (`--quiz-primary`, `--quiz-accent`, `--quiz-danger`, etc.) so the palette
  can be retuned in one place. Component CSS should use the semantic aliases.
- **Neutral text** uses `--text-muted` (chosen to pass WCAG AA on light surfaces).
- Each component carries its own scoped `<style>` block. Layout is responsive (CSS grid with
  `auto-fill`, mobile breakpoints) and respects `prefers-reduced-motion`.
- Accessibility touches: `aria-label`s on the difficulty stars, focus-visible outlines on cards,
  emoji marked `aria-hidden`.
- The color decisions and contrast checks are documented in
  [`docs/quiz-color-style-guide.md`](./docs/quiz-color-style-guide.md),
  [`docs/quiz-color-contrast.md`](./docs/quiz-color-contrast.md), and
  [`docs/quiz-color-audit.md`](./docs/quiz-color-audit.md).

---

## 10. CI/CD & deployment

Two GitHub Actions workflows, both building from `app/` with Node 22 and `npm ci`:

### `deploy.yml` — production
- Triggers on push to `main` (or manual dispatch).
- Builds with `BASE_PATH=/<repo-name>`, uploads `app/build` as a Pages artifact, and deploys via
  `actions/deploy-pages`. Concurrency group `pages` (no in-progress cancellation).

### `preview.yml` — per-PR previews
- On PR `opened`/`synchronize`/`reopened`: builds with
  `BASE_PATH=/<repo>/pr-<number>`, publishes to the `gh-pages` branch under `pr-<number>/`
  (via `peaceiris/actions-gh-pages`), then posts/updates a sticky comment with the preview URL.
- On PR `closed` (`pull_request_target`): checks out `gh-pages`, removes the `pr-<number>/`
  directory, and commits the cleanup.
- Per-PR concurrency with `cancel-in-progress: true` so rapid pushes don't pile up.

This is what makes the studio-ai demo tangible: open a PR, get a live URL automatically, merge,
and watch it ship to production — no manual deploy step.

---

## 11. Deliberate non-goals (v1)

| Decision | Rationale |
|----------|-----------|
| No backend / no DB | A pack edit is one file + one PR — keeps the demo loop tight |
| Static prerender + GitHub Pages | Free hosting, zero infra, PR previews come for free |
| No score / leaderboard / feedback persistence | Scoped out intentionally; future additive layer (likely the existing studio-ai `agent-api` AppSync + DynamoDB stack) |
| Svelte 5 runes mode forced | Modern, type-safe reactivity; matches studio-ai monorepo conventions |
| One pack = one file | Parallelizable: many agents author packs with no merge conflicts |

Future persistence is expected to land as an **additive** layer (server endpoints + a data store)
without changing the static-first content model.

---

## 12. studio-ai integration

- **`.mcp.json`** (copied from `.mcp.json.example`) wires the repo to the studio-ai MCP server at
  `https://app.routeburn.org/api/mcp` over HTTP, sending `Authorization: Bearer ${STUDIO_AI_TOKEN}`
  and `X-Agent-Name: ${AGENT_NAME}`. The real `.mcp.json` (with the token) should be gitignored.
- **`.studio/skills/`** carries customer-owned knowledge the platform agent doesn't ship with:
  - `bootstrap/` — workspace setup (deps, git config, env) before any edits.
  - `verify/` — how to verify a change actually works.
  - `quiz-content-conventions/` — the authoritative pack-authoring rules.

An agent picks up a task from studio-ai, follows the bootstrap skill, makes the change (often a
single pack JSON edit), opens a PR, the preview workflow posts a URL, and merge ships it — the
full "idea to production" loop the app exists to demonstrate.

---

## 13. Local development

```bash
cd app
npm install
npm run dev        # http://localhost:5173

npm run build      # prerender to app/build/
npm run preview    # serve the built output
npm run check      # svelte-check (types)
npm test           # vitest run
```
