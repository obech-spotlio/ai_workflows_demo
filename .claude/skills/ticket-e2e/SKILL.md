---
name: ticket-e2e
description: End-to-end Jira ticket workflow — plan, implement, and finish in one go.
argument-hint: [JIRA-KEY]
disable-model-invocation: true
---

Run the full end-to-end workflow for Jira ticket `$ARGUMENTS`.

This orchestrates the three ticket phases sequentially. Each phase must complete successfully before the next one starts.

## Phase 1 — Plan (`ticket-start`)

1. Use the `ticket-planner` subagent to read the Jira ticket and acceptance criteria via MCP.
2. Inspect existing branches via `git branch -r` to spot naming conventions or existing work.
3. Derive a functionality slug and write the planning handoff to `./specs/<functionality>/$ARGUMENTS.md`.
4. The spec must include ticket summary, acceptance criteria checklist, implementation approach, dependencies, risks, open questions, and suggested branch slug.
5. Create the feature branch in the format `feature/$ARGUMENTS-short-description` (or `fix/` / `chore/` if appropriate). Use `git switch -c <branch>`.

## Phase 2 — Implement (`ticket-implement`)

1. Read the spec from `./specs/<functionality>/$ARGUMENTS.md`.
2. Use the `coder` subagent to implement the required changes against that spec.
3. Use the `reviewer` subagent to run lint, test, and build commands and fix issues if needed.
4. Finish with a release-readiness note: checks run, remaining risks, next action, and spec path.

## Phase 3 — Finish (`ticket-finish`)

1. Confirm the working tree changes belong to ticket `$ARGUMENTS` and re-read the spec.
2. Use the `reviewer` subagent for final verification and report any release blockers.
3. Use the `publisher` subagent to create conventional commits with the Jira key, push the branch, and open the Bitbucket pull request. Never push directly to `main` or `master`.
4. Return the branch name, commit message, verification summary, remaining risks, PR link, and spec path.

## Important

- Do NOT skip phases. Each phase builds on the previous one.
- If any phase fails or encounters a blocker, stop and report the issue — do not continue to the next phase.
- Between phases, briefly summarize what was completed before moving on.
