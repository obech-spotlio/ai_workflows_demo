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

## Phase 1.5 — Design (Stitch)

Only run this phase if the spec's **UI Components** section lists at least one component.

1. Read the **UI Components** section from the spec.
2. Use `mcp__stitch__create_project` to create a Stitch project named after the ticket key (e.g. `SS-3616`).
3. For each UI component or page listed in the spec, call `mcp__stitch__generate_screen_from_text` with a prompt derived from the component's purpose, props, and layout notes in the spec.
4. After generation, call `mcp__stitch__get_screen` for each generated screen and save the result (screen ID, name, and any returned layout/code) into a `## Stitch Designs` section appended to the spec file. Include the Stitch project ID.
5. If Stitch generation fails for any screen, log a warning in the spec and continue — do not block Phase 2.

## Phase 2 — Implement (`ticket-implement`)

1. Read the spec from `./specs/<functionality>/$ARGUMENTS.md`, including the `## Stitch Designs` section if present.
2. Use the `coder` subagent to implement the required changes against that spec. The coder **must** use the Stitch-generated screen designs as the authoritative reference for any UI component layout and structure. If no Stitch designs exist for a component, note the gap and implement a minimal placeholder.
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
