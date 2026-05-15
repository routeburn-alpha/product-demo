---
name: bootstrap-agent
description: Fix an out-of-sync agent workspace by reinstalling dependencies and verifying tests pass.
user-invocable: true
---

# Bootstrap Agent

Fix or refresh the current agent workspace. Idempotent — safe to run multiple times.

## Step 1: Check settings

Read `.claude/settings.local.json`. If `AGENT_NAME` or `AGENT_PORT` are missing, ask the user what name and port to use.

## Step 2: Ensure settings and identity files exist

If missing, write:

`.claude/settings.local.json`:
```json
{
  "env": {
    "AGENT_NAME": "<name>",
    "AGENT_PORT": "<port>"
  }
}
```

`CLAUDE.local.md`:
```markdown
# Agent Identity

- **Name**: <name>
- **Port**: <port> (Vite dev server)
```

## Step 3: Sync with main

Stash local changes if any, rebase onto origin/main, restore stash:

```bash
git stash  # only if dirty
git fetch origin main && git rebase origin/main
git stash pop  # only if stashed
```

If there are rebase conflicts, stop and ask the user.

## Step 4: Install dependencies

Dependencies live under `app/`:

```bash
cd app
rm -rf node_modules && npm install
```

## Step 5: Verify the app builds and tests pass

```bash
cd app
npm run check
npm test
```

Optionally start the dev server to confirm it boots (don't leave it running in the background):

```bash
cd app
PORT=$AGENT_PORT npm run dev
```

## Step 6: Instruct user to restart Claude Code

After all steps complete, tell the user:

> Bootstrap complete! You need to **restart Claude Code** for the new environment variables and MCP configuration to take effect. Exit this session and start a new one.

This is required because Claude Code only reads `.env` files and MCP server config at startup.

---

## Troubleshooting

- **Rebase conflicts**: ask the user
- **npm install failure**: `rm -rf app/node_modules app/package-lock.json` and retry (only nuke the lockfile as a last resort and call it out to the user)
- **Port already in use**: another agent is probably running on the same port — bump `AGENT_PORT` in `.claude/settings.local.json`
