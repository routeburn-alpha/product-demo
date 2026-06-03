---
name: verify
description: Verify the Quiz Lab change works before submitting — runs build, type-check, and tests. Activate during phase 4 (Verify) of the AI-Native SDLC, after the implementation is finished and before the commit/push/PR/submit_for_review step. Owns the customer-specific verification commands that the platform prompt deliberately does not know about.
---

# verify

Quiz Lab's verification step. Runs from `app/` (the SvelteKit project root).

## Steps

One `bash` tool call. Quiz Lab's build + check + test together run in well under 30s, so a single combined log keeps the agent's tool round-trips down. The commands are chained with `&&` so the first failure stops the chain; `set -o pipefail` ensures the failing command's exit code propagates through the tee pipe.

```bash
set -o pipefail; cd /workspace/studio-demo/app && \
  pnpm run build && pnpm run check && pnpm test -- --run \
  2>&1 | tee /workspace/studio-demo/logs/verify.log | tail -20 ; echo "EXIT=${PIPESTATUS[0]}"
```

If `EXIT=N` prints with N≠0, **STOP IMMEDIATELY**: `tail -100 /workspace/studio-demo/logs/verify.log` to gather context (the trailing 20 lines printed inline rarely cover the real failure), post a single `create_comment` on the task describing the failure with the relevant log section attached, then end your turn. Do NOT proceed to phase 5. Do NOT call `submit_for_review`.

## What this skill does not do

- Does not commit, push, or open the PR. That's phase 5 (Submit Candidate), owned by the platform's submit skill.
- Does not run customer-side deploys. Not part of verify for Quiz Lab.
