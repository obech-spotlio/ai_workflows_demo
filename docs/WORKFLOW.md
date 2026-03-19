# Claude Code Workflow — Jira to Bitbucket

This project implements an automated development workflow powered by Claude Code, connecting Jira (source of truth) to Bitbucket (code delivery) with guardrails enforced at every step.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer runs /ticket-start, /ticket-implement, /ticket-finish │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Claude Code (orchestrator)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Hooks    │  │ Skills   │  │ Agents   │  │ MCP Servers      │ │
│  │ (guards) │  │ (prompts)│  │ (workers)│  │ (external APIs)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
        │                │              │                │
        ▼                ▼              ▼                ▼
  Enforce rules    Guide output   Execute tasks    Read/write
  before/after     formatting     autonomously     external data
  tool calls       and scope      with scoped      (Jira, Bitbucket)
                                  permissions
```

## Slash Commands (User Entry Points)

The workflow exposes three slash commands that drive a Jira ticket from analysis to pull request. Each command has a clear exit condition so the next stage receives a usable handoff instead of just a prose summary.

| Command                     | Purpose                    | What happens                                                                                                                                    |
| --------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/ticket-start ABC-123`     | Analyze and prepare        | Reads Jira via MCP, groups the ticket under a functionality folder, writes `./specs/<functionality>/ABC-123.md`, and returns the branch command |
| `/ticket-implement ABC-123` | Build and validate         | Reads the persisted spec, implements against it, runs the smallest relevant checks, and returns a release-readiness note                        |
| `/ticket-finish ABC-123`    | Publish and request review | Re-runs final verification against the spec, creates a compliant commit, pushes the branch, and opens the PR                                    |

## Workflow Contract

The workflow works best when each stage returns structured output the next stage can trust.

| Stage          | Owner            | Required output                                                                                                                  | Exit gate                                     |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Intake         | `ticket-planner` | Spec file in `./specs/<functionality>/<ticket>.md` with ticket summary, acceptance criteria, constraints, risks, and branch slug | Spec exists and scope is clear enough to code |
| Implementation | `coder`          | Code changes, test updates, acceptance criteria coverage notes tied back to the spec                                             | Changes map back to the stored spec           |
| Verification   | `reviewer`       | Checks run, failures fixed, remaining risks, recommended next action against the spec                                            | Repository is ready or blockers are explicit  |
| Publish        | `publisher`      | Branch name, commit message, push result, and PR URL using the spec for messaging                                                | Branch is safely published and review-ready   |

## Subagents

Each slash command delegates to specialized subagents with scoped permissions and models:

| Agent            | Model  | Role                                            | Tools                               | MCP Access                             |
| ---------------- | ------ | ----------------------------------------------- | ----------------------------------- | -------------------------------------- |
| `ticket-planner` | Haiku  | Jira scope analysis plus persisted spec handoff | Read, Grep, Glob, Edit, Write, Bash | Jira (read)                            |
| `coder`          | Sonnet | Focused code and test implementation            | Read, Grep, Glob, Edit, Write, Bash | None                                   |
| `reviewer`       | Sonnet | Lint, test, build, and readiness verification   | Read, Grep, Glob, Bash, Edit, Write | None                                   |
| `publisher`      | Sonnet | Branch, commit, push, and PR workflow           | Read, Bash                          | Bitbucket (read + `createPullRequest`) |

### Agent Flow per Command

**`/ticket-start`**

```
ticket-planner → planning handoff + branch command
```

**`/ticket-implement`**

```
ticket-planner → coder → reviewer → readiness report
```

**`/ticket-finish`**

```
reviewer → publisher → PR link
```

## Spec Storage

`ticket-planner` persists its output under the repository root in:

```text
specs/<functionality>/<ticket-key>.md
```

Rules:

- Group specs by stable functionality slug, not by ticket type.
- Keep slugs short and filesystem-safe.
- Reuse the same functionality folder for related tickets in the same area.
- `coder`, `reviewer`, and `publisher` must read that spec before acting when it exists.

## Skills (Reusable Prompt Templates)

Skills are declarative prompt fragments that agents load for consistent behavior:

| Skill                 | Used by                    | Purpose                                                                       |
| --------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `jira-intake`         | ticket-planner, coder      | Extract acceptance criteria, scope, risks from Jira ticket                    |
| `conventional-commit` | publisher                  | Format: `<type>(<scope>): TICKET-123 summary`                                 |
| `bitbucket-pr`        | publisher                  | PR title format `[TICKET-123]`, body template with summary/verification/risks |
| `release-readiness`   | coder, reviewer, publisher | Checklist: scope alignment, tests, lint, build, risks                         |

## Hooks (Automated Guardrails)

Hooks run automatically before/after tool calls to enforce workflow rules without relying on the LLM to self-police.

### SessionStart

- **`session_start.py`** — Injects a reminder into every new conversation: workflow commands available, Jira is read-only, Bitbucket is read-only except PR creation.

### PreToolUse (matcher: `Bash|mcp__jira__.*|mcp__bitbucket__.*`)

- **`pre_tool_use.py`** — The core guardrail. Intercepts tool calls and blocks violations before they execute:

| Check                       | Rule                                               | Block message                                         |
| --------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| `git push` to main/master   | Forbidden                                          | "Push a Jira ticket branch and open a PR instead"     |
| `git switch -c` branch name | Must match `(feature\|fix\|chore)/TICKET-123-slug` | "Use feature\|fix\|chore with a Jira ticket key"      |
| `git commit -m` message     | Must match conventional commit with ticket key     | "Use conventional commit format with Jira ticket key" |
| Jira MCP tools              | Only whitelisted read tools allowed                | "Jira is read-only in this workflow"                  |
| Bitbucket MCP tools         | Read-style tools plus `createPullRequest` only     | "Only read operations and PR creation are allowed"    |

### PostToolUse (matcher: `Bash|mcp__jira__.*|mcp__bitbucket__.*`)

- **`post_tool_use.py`** — Logs every tool invocation (tool name + input) to `.claude/logs/workflow-events.log` as JSONL.

### PermissionRequest / SubagentStart / SubagentStop

- **`log_event.py`** — Logs permission requests and subagent lifecycle events to the same log file for audit trail.

## MCP Servers

| Server        | Type        | URL                                 | Auth                                                                                         | Access                                             |
| ------------- | ----------- | ----------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Jira**      | HTTP remote | `https://mcp.atlassian.com/v1/mcp`  | OAuth 2.1 (browser consent)                                                                  | Read-only (enforced by hooks)                      |
| **Bitbucket** | stdio       | `bitbucket-mcp@latest`              | Env vars: `BITBUCKET_URL`, `BITBUCKET_WORKSPACE`, `BITBUCKET_USERNAME`, `BITBUCKET_PASSWORD` | Read + `createPullRequest` (enforced by hooks)     |
| **Stitch**    | HTTP remote | `https://stitch.googleapis.com/mcp` | API key via `STITCH_API_KEY` env var                                                         | Design system tokens, component specs, screen code |

### Stitch MCP Tools

| Tool               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `build_site`       | Build a site from a Stitch project by mapping screens to routes |
| `get_screen_code`  | Retrieve screen HTML code content                               |
| `get_screen_image` | Download screen screenshot as base64                            |

## Permissions Model

Defined in `.claude/settings.json`:

**Allowed by default** (no user prompt):

- All file operations (Read, Edit, Write, Glob, Grep)
- Git commands (status, branch, log, diff, switch, checkout, add, commit, push)
- Package managers (npm, pnpm, yarn, bun)
- Test runners (pytest, vitest, jest, go test, cargo test)
- All project subagents (`ticket-planner`, `coder`, `reviewer`, `publisher`) and built-in agents (Explore, Plan, general-purpose)

**Explicitly denied:**

- `git push origin main` / `git push origin master`

**Requires user approval:**

- Any tool not in the allow list
- WebFetch to non-whitelisted domains

## Audit Log

All tool calls, permission requests, and subagent lifecycle events are logged to:

```
.claude/logs/workflow-events.log
```

Format: JSONL with `timestamp`, `event`, `tool`/`payload`, and `tool_input`.

## Status Line

A custom status line (`.claude/statusline-command.sh`) displays the current model name and token usage in the Claude Code UI:

```
Claude 4.6 (Opus) | 45,231 / 200,000 tokens
```

## File Structure

```
.claude/
├── settings.json              # Permissions, hooks, status line config
├── settings.local.json        # Session-specific permission overrides
├── statusline-command.sh      # Custom status line script
├── logs/
│   └── workflow-events.log    # Audit trail (JSONL)
├── hooks/
│   ├── session_start.py       # Inject workflow context on session start
│   ├── pre_tool_use.py        # Enforce git, Jira, Bitbucket guardrails
│   ├── post_tool_use.py       # Log tool invocations
│   └── log_event.py           # Log permission and subagent events
├── agents/
│   ├── ticket-planner.md      # Jira scope analysis + spec write (Haiku)
│   ├── coder.md               # Code implementation (Sonnet)
│   ├── reviewer.md            # Lint/test/build verification (Sonnet)
│   └── publisher.md           # Branch/commit/push/PR (Sonnet)
├── specs/
│   └── <functionality>/
│       └── ABC-123.md         # Persisted ticket planning spec
└── skills/
    ├── ticket-start/SKILL.md
    ├── ticket-implement/SKILL.md
    ├── ticket-finish/SKILL.md
    ├── jira-intake/SKILL.md
    ├── conventional-commit/SKILL.md
    ├── bitbucket-pr/SKILL.md
    └── release-readiness/SKILL.md
```

## Quick Start

```bash
# 1. Ensure MCP auth is configured
#    - Jira: OAuth consent opens on first use
#    - Bitbucket: set BITBUCKET_URL, BITBUCKET_WORKSPACE, BITBUCKET_USERNAME, BITBUCKET_PASSWORD
#    - Stitch: set STITCH_API_KEY in .envrc and run `direnv allow`

# 2. Start Claude Code in the project directory
claude

# 3. Analyze a Jira ticket
/ticket-start ABC-123

# 4. Implement it
/ticket-implement ABC-123

# 5. QA, commit, push, and open PR
/ticket-finish ABC-123
```
