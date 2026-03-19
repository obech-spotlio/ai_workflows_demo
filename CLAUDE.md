# Language

- Always respond and write all output in English, regardless of the language used by the user.

# Jira to Bitbucket Workflow

- Use Jira as the source of truth for scope, acceptance criteria, and implementation notes.
- Never mutate Jira through MCP.
- Use git CLI for all version control operations (branches, commits, pushes).
- Jira MCP is wired to the official Atlassian Remote MCP (`https://mcp.atlassian.com/v1/mcp`) using OAuth 2.1. On first use Claude Code will open a browser for the Atlassian consent screen; subsequent sessions refresh automatically (re-auth only needed after 90 days of inactivity).
- Stitch MCP is wired to `https://stitch.googleapis.com/mcp` using an API key via `STITCH_API_KEY` env var.
- Branch names must include the Jira ticket key, for example `feature/ABC-123-short-description`.
- Commit messages must follow conventional commits and include the Jira ticket key, for example `feat(api): ABC-123 add retry policy`.
- Direct pushes to `main` and `master` are forbidden.
- Pull request titles should start with `[ABC-123]` and summarize the change.
- Before opening a PR, confirm lint, test, and build status when the repository supports them.

## Claude Code workflow

- Use `/ticket-start ABC-123` to analyze the ticket and prepare the branch plan.
- Use `/ticket-implement ABC-123` to implement the ticket with subagents.
- Use `/ticket-finish ABC-123` to run final QA, commit, push, and open the Bitbucket PR.
- Prefer the project subagents in `.claude/agents/`: `ticket-planner`, `coder`, `reviewer`, and `publisher`.
- `ticket-planner` must persist its handoff in `./specs/<functionality>/<ticket-key>.md`, grouped by stable functionality slug.
- Expected handoff: spec path and branch slug from `/ticket-start`, validated implementation and readiness note from `/ticket-implement`, then verification summary, commit, and PR link from `/ticket-finish`.
- Claude Code hooks in `.claude/settings.json` enforce git rules, Jira read-only access, and Bitbucket read-only access except PR creation.
