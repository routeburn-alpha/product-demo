# Quiz Lab

A product trivia app built to showcase the studio-ai workflow end-to-end: ideas → tasks → branches → PRs → production. Pick a pack, play a round, and watch new packs ship while you play.

Quiz Lab is a starter template — fork it, point it at your own studio-ai workspace, and use it to demo "idea to production" for your team.

New here? Start with the [Onboarding guide](./ONBOARDING.md) for the end-to-end Studio AI walkthrough.

Last updated: 2026-06-17

## Getting started

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173`.

## What's in the box

- Two seeded packs: **Premier League Trivia** and **NYT-Easy Trivia**
- A pack picker home page (`/`)
- A play screen (`/play/[pack]`) with one-question-at-a-time scoring
- `.mcp.json` pre-wired for the studio-ai MCP server so an agent can pick up tasks against this repo, but will need token (get from Admin) - this should be added to your .gitignore file once token is entered
- GitHub Pages deploy + PR-preview workflows in `.github/workflows/`

## Adding a new pack

1. Drop a JSON file into `app/src/lib/data/packs/`
2. Follow the shape in `app/src/lib/packs.ts` — `id`, `title`, `description`, `questions[]`
3. Open a PR. The preview URL is posted automatically.

That's the whole loop. Try it as your first studio-ai task.

## Stack

SvelteKit 2 · Svelte 5 (runes) · TypeScript · Vite · Vitest · adapter-static
