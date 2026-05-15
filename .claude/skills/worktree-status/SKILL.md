---
name: worktree-status
description: Check whether the agent workspace is clean and ready to work — verifies the working tree is clean, the branch is up to date with origin/main, and there are no merged branches left to clean up. Use when the user asks "am I clean?", "is the workspace clean?", "what needs cleaning up?", or wants to know if the environment is ready to pick up a task.
tools: Bash
---

# Worktree Status

Check the current worktree and report what (if anything) needs cleaning up.

## What to check

Run these in parallel and collect results:

```bash
# 1. Working tree clean?
git status --porcelain

# 2. Current branch + how it compares to origin/main
git fetch --quiet origin main
git rev-parse --abbrev-ref HEAD
git rev-list --left-right --count origin/main...HEAD

# 3. Local branches already merged into main (excluding main itself and the current branch)
git branch --merged origin/main | grep -vE '^\*|^\s*main$' | sed 's/^[[:space:]]*//'

# 4. node_modules present under app/?
test -d app/node_modules && echo "installed" || echo "missing"
```

## How to report

- **Clean**: working tree empty, 0 commits behind origin/main, no merged branches lingering, `app/node_modules` installed → confirm the workspace is ready.
- **Not clean**: list each issue with the exact fix command. Offer to run them:
  - Uncommitted changes → ask the user whether to commit, stash, or discard before acting.
  - Behind origin/main → offer `git merge origin/main` (or `git rebase origin/main` if the user prefers; check existing branch history for the convention).
  - Merged branches present → offer `git branch -d <branch>` for each.
  - `app/node_modules` missing → offer `cd app && npm install`.

Don't run destructive operations (discarding changes, force-deleting branches) without explicit user confirmation.
