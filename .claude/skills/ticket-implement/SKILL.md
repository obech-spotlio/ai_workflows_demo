---
name: ticket-implement
description: Implement a Jira ticket with specialized subagents.
argument-hint: [JIRA-KEY]
disable-model-invocation: true
---

Implement Jira ticket `$ARGUMENTS`.

Workflow:

1. Load the context from `jira-intake`, `conventional-commit`, and `release-readiness`.
2. Find and read the ticket spec from `./specs/<functionality>/$ARGUMENTS.md`. If it does not exist yet, use the `ticket-planner` subagent to create it first.
3. **Stitch design generation** — if the spec's **UI Components** section lists at least one component:
   a. Call `mcp__stitch__create_project` with the ticket key as the project name.
   b. For each UI component or page, call `mcp__stitch__generate_screen_from_text` with a prompt derived from the component's purpose, props, and layout notes.
   c. Retrieve each generated screen via `mcp__stitch__get_screen` and append all results (project ID, screen IDs, names, layout/code) to a `## Stitch Designs` section in the spec file.
   d. If generation fails for a screen, log a warning in the spec and continue.
4. Use the `coder` subagent to implement the required changes in the repository against that spec. The coder **must** treat the `## Stitch Designs` section as the authoritative UI reference. If no Stitch designs were generated, implement a minimal placeholder and note the gap.
5. Use the `reviewer` subagent to run the relevant lint, test, and build commands and fix issues if needed.
6. Keep the work aligned to ticket `$ARGUMENTS` and finish with a release-readiness note containing checks run, remaining risks, next action, and the spec path used.
