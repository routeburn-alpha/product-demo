---
name: quiz-content-conventions
description: Conventions for adding or editing trivia questions in this repo's quiz packs. Activate whenever a task adds, edits, removes, or reviews quiz questions inside `app/src/lib/data/packs/*.json` — covers id format, difficulty scale, choice count, explanation voice, and the duplicate-correct-answer trap. The platform agent does not know these rules; follow this skill before writing JSON.
---

# Quiz content conventions

Customer-owned content rules for `app/src/lib/data/packs/*.json`. The studio-ai platform agent doesn't know how our packs are structured or how difficulty is calibrated — this skill carries that knowledge.

## When to activate

A task asks you to:

- Add one or more questions to an existing pack.
- Edit the prompt, choices, or explanation of an existing question.
- Create a new pack.
- Review or grade existing questions.

If the task is unrelated to pack content (build config, UI, scoring algorithm, routing), this skill does not apply.

## Question shape

Each question in `questions[]` must have **exactly** these fields:

```json
{
  "id": "<pack-prefix>-<sequential-number>",
  "prompt": "<question text, 5–120 chars, no trailing period unless it ends with a colon>",
  "choices": ["<choice 1>", "<choice 2>", "<choice 3>", "<choice 4>"],
  "correctIndex": 0,
  "difficulty": 1,
  "explanation": "<one short sentence, ends with a period>"
}
```

- **`id`** — kebab-case, prefix matches the pack's filename stem. E.g. `nyt-easy.json` uses `ne-1`, `ne-2`, …; `premier-league.json` uses `pl-1`, `pl-2`. **Sequential, no gaps.** When inserting, renumber subsequent IDs.
- **`prompt`** — colon-terminated for fill-in-style questions ("Capital of France:"), period for full sentences. Never a question mark — the prompt itself is the cue.
- **`choices`** — **exactly 4**. No more, no fewer. Each ≤ 32 chars. No "All of the above" / "None of the above" — they're banned.
- **`correctIndex`** — 0-indexed integer. Verify the answer at this index is actually correct. **Common bug: copying a question and forgetting to update `correctIndex`.**
- **`difficulty`** — integer 1–5. See the difficulty scale below. Default new questions to `1` for easy packs, `3` for the rest.
- **`explanation`** — one sentence, ≤ 140 chars. Voice is *informative-friendly*, not pedantic. Always end with a period. Lead with the correct answer when the question hinges on a specific fact.

## Difficulty scale

| Level | Definition | Example trigger |
|---|---|---|
| 1 | Anyone with general knowledge could answer. | "Capital of France:" |
| 2 | Common-knowledge facts; one obvious distractor among the wrong choices. | "Year of the Apollo 11 moon landing:" |
| 3 | Requires domain interest but not study. | "Painter of *The Persistence of Memory*:" |
| 4 | Requires recent or specialized knowledge. | "First woman to win the Fields Medal:" |
| 5 | Expert / trivia-night ringer. | "Atomic number of Tennessine:" |

If a pack's title contains "Easy" or "Mini", cap difficulty at 2.

## Common traps

- **Duplicate correct answers.** When editing choices, re-check `correctIndex`. The most-common review reject is "the new correct answer is at index 2 but you left `correctIndex: 0`."
- **Adjacent IDs.** If the file has `ne-7` then jumps to `ne-9`, that's a bug — renumber.
- **Pack `category` and `description`.** Don't edit these unless the task asks for it; they're surfaced in the pack picker UI.
- **No emoji in `prompt` or `choices`.** Reads badly in the player and breaks our font fallbacks.

## Workflow

1. Read the pack JSON top-to-bottom to internalize voice and difficulty.
2. Draft the new question(s) following the shape above.
3. Verify `correctIndex` by re-stating the correct choice out loud (in chat, as an agent message).
4. Re-check sequential IDs.
5. Save and run the build (`cd app && npm run build`) to catch JSON schema errors before pushing.

## Out of scope

- Changing pack scoring or timing logic (lives in `app/src/lib/QuizPlayer.svelte`).
- Adding new pack files (separate skill — TODO).
- Editing the pack picker UI.
