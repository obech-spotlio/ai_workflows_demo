# Jira to Bitbucket Workflow

- Use Jira as the source of truth for scope, acceptance criteria, and implementation notes.
- Use Bitbucket only to read repository metadata and to create pull requests.
- Never mutate Jira through MCP.
- Never create, delete, or update branches through MCP.
- Jira MCP is wired to `@aashari/mcp-server-atlassian-jira` and expects `ATLASSIAN_SITE_NAME`, `ATLASSIAN_USER_EMAIL`, and `ATLASSIAN_API_TOKEN`.
- Bitbucket MCP is wired to `bitbucket-mcp@latest` and expects `BITBUCKET_URL`, `BITBUCKET_WORKSPACE`, `BITBUCKET_USERNAME`, and `BITBUCKET_PASSWORD`.
- Branch names must include the Jira ticket key, for example `feature/ABC-123-short-description`.
- Commit messages must follow conventional commits and include the Jira ticket key, for example `feat(api): ABC-123 add retry policy`.
- Direct pushes to `main` and `master` are forbidden.
- Pull request titles should start with `[ABC-123]` and summarize the change.
- Before opening a PR, confirm lint, test, and build status when the repository supports them.

## OpenCode Commands

The workflow exposes three executable commands in `opencode.json`:

| Command                    | Purpose                    | What happens                                                                                                                                    |
| -------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ticket-start ABC-123`     | Analyze and prepare        | Reads Jira via MCP, groups the ticket under a functionality folder, writes `./specs/<functionality>/ABC-123.md`, and returns the branch command |
| `ticket-implement ABC-123` | Build and validate         | Reads the persisted spec, implements against it, runs the smallest relevant checks, and returns a release-readiness note                        |
| `ticket-finish ABC-123`    | Publish and request review | Re-runs final verification against the spec, creates a compliant commit, pushes the branch, and opens the PR                                    |

## Workflow Contract

Each stage must return structured output that the next stage can trust.

| Stage          | Owner            | Required output                                                                                                                  | Exit gate                                     |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Intake         | `ticket-planner` | Spec file in `./specs/<functionality>/<ticket>.md` with ticket summary, acceptance criteria, constraints, risks, and branch slug | Spec exists and scope is clear enough to code |
| Implementation | `coder`          | Code changes, test updates, acceptance criteria coverage notes tied back to the spec                                             | Changes map back to the stored spec           |
| Verification   | `reviewer`       | Checks run, failures fixed, remaining risks, recommended next action against the spec                                            | Repository is ready or blockers are explicit  |
| Publish        | `publisher`      | Branch name, commit message, push result, and PR URL using the spec for messaging                                                | Branch is safely published and review-ready   |

## Agents

OpenCode delegates work to role-specific agents in `.opencode/agents/`:

| Agent            | Role                                          |
| ---------------- | --------------------------------------------- |
| `ticket-planner` | Read-only Jira scope and branch analysis      |
| `coder`          | Focused code and test implementation          |
| `reviewer`       | Lint, test, build, and readiness verification |
| `publisher`      | Branch, commit, push, and PR workflow         |

### Agent Flow per Command

**`ticket-start`**

```
ticket-planner -> planning handoff + branch command
```

**`ticket-implement`**

```
ticket-planner -> coder -> reviewer -> readiness report
```

**`ticket-finish`**

```
reviewer -> publisher -> PR link
```

## Spec Storage

`ticket-planner` must persist its output under the repository root in:

```text
specs/<functionality>/<ticket-key>.md
```

Rules:

- Group specs by stable functionality slug, not by ticket type.
- Keep slugs short and filesystem-safe.
- Reuse the same functionality folder for related tickets in the same area.
- `coder`, `reviewer`, and `publisher` must read that spec before acting when it exists.

## Skills

The reusable prompts in `.opencode/skills/` support the same workflow:

| Skill                 | Used by                    | Purpose                                                                         |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `jira-intake`         | ticket-planner, coder      | Extract acceptance criteria, scope, risks from Jira ticket                      |
| `conventional-commit` | publisher                  | Format: `<type>(<scope>): TICKET-123 summary`                                   |
| `bitbucket-pr`        | publisher                  | PR title format `[TICKET-123]`, body template with summary, verification, risks |
| `release-readiness`   | coder, reviewer, publisher | Checklist: scope alignment, tests, lint, build, risks                           |

## Guardrails

`.opencode/plugins/workflow-guardrails.js` enforces the workflow instead of relying on agent instructions alone.

- Jira MCP is read-only.
- Bitbucket MCP is read-only except pull request creation.
- Branch creation must follow `feature|fix|chore/TICKET-123-slug`.
- Commit messages must use conventional commits with the Jira key.
- Direct pushes to `main` and `master` are blocked.
