---
name: create-agent
description: Create a new agent workspace by adding a git worktree as a sibling directory and seeding its Claude settings.
user_invocable: true
---

# Create Agent

Create a new agent workspace using a git worktree. Does the bare minimum so `/bootstrap-agent` can run in the new directory.

## Agent naming

Ask the user what they want to name the agent identifier (e.g., "kevin", "felix", "alice"). The dev-server port is derived from the agent number: `port = 5173 + agent number` (5173 is the Vite default).

---

## Step 1: Find next available agent number

Derive the base directory and worktree prefix from the current repo, so new agents are siblings of this worktree and the prefix works in any fork of the template:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
BASE_DIR=$(dirname "$REPO_ROOT")
REPO_NAME=$(basename "$REPO_ROOT")
ls -d "$BASE_DIR/$REPO_NAME-"* 2>/dev/null | sed "s|.*$REPO_NAME-||" | grep -oE '^[0-9]+' | sort -n | tail -1
```

Next agent number = highest existing number + 1. If none exist, start at 1.

## Step 2: Ask for agent name

If the user already provided a name, use it. Otherwise, ask: "What do you want to name this agent?"

The port is `5173 + NEXT_NUM`.

## Step 3: Create worktree

The directory name includes both the number and the identifier: `$REPO_NAME-$NEXT_NUM-$AGENT_NAME`

```bash
git worktree prune
git worktree add -b agent/$AGENT_NAME "$BASE_DIR/$REPO_NAME-$NEXT_NUM-$AGENT_NAME" main
```

## Step 4: Create .claude/settings.local.json

```bash
mkdir -p "$BASE_DIR/$REPO_NAME-$NEXT_NUM-$AGENT_NAME/.claude"
```

Write the settings file (this is what bootstrap reads to know the agent's identity):
```json
{
  "env": {
    "AGENT_NAME": "<agent name>",
    "AGENT_PORT": "<port number>"
  }
}
```

## Step 5: Report and provide next steps

Tell the user:
```
New agent created at $BASE_DIR/$REPO_NAME-N-NAME

To complete setup:
1. Open a new terminal
2. cd $BASE_DIR/$REPO_NAME-N-NAME
3. claude
4. Run /bootstrap-agent to install dependencies and verify tests
```
