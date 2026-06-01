---
name: bootstrap
description: Prepare the workspace before any code edits, branch creation, or bash commands run. Activate at the very start of a managed-claude run, immediately after `register_agent` and `get_task`. Owns the customer-specific setup that the platform prompt deliberately does not know about — install deps, mount the git config, set environment variables. The platform prompt names this skill explicitly; do not skip it.
---

# bootstrap

Customer-defined workspace prep for the product-demo repo (`routeburn-alpha/product-demo`). Runs first, before the agent makes any edits or creates branches.

## Steps

Run each bash line as its **own** `bash` tool call. Do not chain with `&&` — chaining swallows intermediate exit codes, and when the chain ends in a pipe (`| tail -5`) the chain's exit code becomes `tail`'s, hiding the real failure.

After each step, if `EXIT=N` prints with N≠0, **STOP IMMEDIATELY**: `tail -50 logs/<that-step>.log` to gather context, post a single `create_comment` on the task describing the failure with the tail attached, then end your turn. Do NOT proceed. Do NOT call `submit_for_review`.

```bash
set -o pipefail
cd /workspace/product-demo
mkdir -p logs
ln -sf /mnt/session/uploads/git/gitconfig ~/.gitconfig ; echo "EXIT=$?"
( cd /workspace/product-demo/app && npm ci ) 2>&1 | tee logs/npm-ci.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
```

## Repo layout note

The app source lives in `app/` — a subdirectory of the repo root. Run `npm` commands from `/workspace/product-demo/app`. Run `git` commands from `/workspace/product-demo` (the repo root).

## What this skill does not do

- Does not create the PR branch. The platform prompt handles `git checkout -b`.
- Does not run tests, build, or deploy. The `studio-precommit` skill owns those before the push.
- Does not run AWS infrastructure setup. product-demo has no AWS dependencies.
