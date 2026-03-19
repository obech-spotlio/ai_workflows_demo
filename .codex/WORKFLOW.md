# Codex Workflow

This repository uses a Jira-to-pull-request workflow with explicit stage handoffs. Codex should follow this workflow when the user asks to start, implement, finish, or publish work for a Jira ticket.

## Core Rules

- Use Jira as the source of truth for scope, acceptance criteria, and implementation notes.
- Never mutate Jira through MCP or API tools.
- Use git CLI for all version control operations.
- Branch names must include the Jira ticket key, for example `feature/ABC-123-short-description`.
- Commit messages must follow conventional commits and include the Jira ticket key, for example `feat(api): ABC-123 add retry policy`.
- Direct pushes to `main` and `master` are forbidden.
- Pull request titles should start with `[ABC-123]`.
- Before opening a pull request, confirm lint, test, and build status when the repository supports them.

## Codex Commands

Codex should treat these user requests as workflow entry points even if they are written in natural language instead of slash-command form.

| Command                    | Purpose                    | Required result                                                                                                              |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ticket-start ABC-123`     | Analyze and prepare        | Write `./specs/<functionality>/ABC-123.md` with the planning handoff and return the exact `git switch -c ...` command        |
| `ticket-implement ABC-123` | Build and validate         | Implement against the persisted spec, run the smallest relevant checks, and return a release-readiness note                  |
| `ticket-finish ABC-123`    | Publish and request review | Re-run final verification against the spec, create a compliant commit, push the branch, and open or prepare the pull request |

## Workflow Contract

Each stage must return structured output that the next stage can trust.

| Stage          | Role             | Required output                                                                                                                  | Exit gate                                     |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Intake         | `ticket-planner` | Spec file in `./specs/<functionality>/<ticket>.md` with ticket summary, acceptance criteria, constraints, risks, and branch slug | Spec exists and scope is clear enough to code |
| Implementation | `coder`          | Code changes, test updates, acceptance criteria coverage notes tied back to the spec                                             | Changes map back to the stored spec           |
| Verification   | `reviewer`       | Checks run, failures fixed, remaining risks, recommended next action against the spec                                            | Repository is ready or blockers are explicit  |
| Publish        | `publisher`      | Branch name, commit message, push result, and pull request URL or creation command using the spec for messaging                  | Branch is safely published and review-ready   |

## Role Sequence

Codex should emulate these roles internally and keep outputs aligned with them:

1. `ticket-planner`: Read Jira scope, acceptance criteria, and branch context without editing code.
2. `coder`: Make focused repository changes and note which acceptance criteria were covered.
3. `reviewer`: Run the smallest relevant lint, test, and build checks; fix straightforward issues when safe.
4. `publisher`: Prepare the branch, create a compliant commit, push the ticket branch, and create the pull request when the environment supports it.

## Expected Flow

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

## Guardrails

- Jira access is read-only.
- Pull-request hosting access should be treated as read-only except pull request creation.
- Do not create, delete, or update branches through MCP tools.
- Do not merge, approve, decline, or modify existing pull requests unless the user explicitly asks.
- If a workflow step cannot be executed because a tool or credential is missing, stop at the last valid stage and report the exact blocker.
