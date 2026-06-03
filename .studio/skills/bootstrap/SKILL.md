---
name: bootstrap
description: Prepare the workspace before any code edits, branch creation, or bash commands run. Activate at the very start of a managed-claude run, immediately after `register_agent` and `get_task` — this is phase 1 (Bootstrap) of the AI-Native SDLC. Owns the customer-specific setup that the platform prompt deliberately does not know about — install deps, mount the git config, set environment variables.
---

# bootstrap

Customer-defined workspace prep for the Quiz Lab repo (`tcochran/studio-demo`). Runs first, before the agent makes any edits or creates branches.

## Steps

Run each bash line as its **own** `bash` tool call. Do not chain with `&&` — chaining swallows intermediate exit codes, and when the chain ends in a pipe (`| tail -5`) the chain's exit code becomes `tail`'s, hiding the real failure.

After each step, if `EXIT=N` prints with N≠0, **STOP IMMEDIATELY**: `tail -50 logs/<that-step>.log` to gather context, post a single `create_comment` on the task describing the failure with the tail attached, then end your turn. Do NOT proceed. Do NOT call `submit_for_review`.

```bash
set -o pipefail
cd /workspace/studio-demo
mkdir -p logs
ln -sf /mnt/session/uploads/git/gitconfig ~/.gitconfig ; echo "EXIT=$?"
```

```bash
set -o pipefail
cd /workspace/studio-demo
LOCK_HASH=$(sha256sum app/pnpm-lock.yaml | awk '{print $1}' | head -c 16)
PREWARM_URL="https://github.com/tcochran/studio-demo/releases/download/prewarm-${LOCK_HASH}/prewarm.tar.gz"
if curl -fsSL "$PREWARM_URL" -o /tmp/prewarm.tar.gz 2>logs/prewarm-curl.log; then
  ( cd app && tar xzf /tmp/prewarm.tar.gz ) 2>&1 | tee logs/prewarm-extract.log | tail -5
  echo "PREWARM_HIT lockHash=$LOCK_HASH"
  echo "EXIT=0"
else
  echo "PREWARM_MISS lockHash=$LOCK_HASH — falling back to pnpm install"
  ( cd app && corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile ) 2>&1 | tee logs/pnpm-install.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
fi
```

Try the **prewarm tarball** first (a release named `prewarm-<lockhash>` on `tcochran/studio-demo`), fall back to `pnpm install --frozen-lockfile` on cache miss. Quiz Lab migrated from npm to pnpm in 2026-06; the lockfile is `pnpm-lock.yaml`, not `package-lock.json`. The release name is keyed by the first 16 hex chars of `sha256(pnpm-lock.yaml)`. Building and publishing the tarball is a manual one-shot today (run `pnpm install` locally, tar, `gh release create`); a CI workflow will own that later.

## Repo layout note

The app source lives in `app/` — a subdirectory of the repo root. Run `npm` commands from `/workspace/studio-demo/app`. Run `git` commands from `/workspace/studio-demo` (the repo root).

## What this skill does not do

- Does not create the PR branch. The platform prompt handles `git checkout -b` in phase 3 (Code).
- Does not run tests, build, or deploy. The `verify` skill owns those in phase 4.
- Does not run AWS infrastructure setup. Quiz Lab has no AWS dependencies.
