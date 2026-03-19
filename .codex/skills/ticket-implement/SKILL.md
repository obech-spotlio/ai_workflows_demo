---
name: ticket-implement
description: Implement a Jira ticket with specialized workflow roles.
argument-hint: [JIRA-KEY]
---

Implement Jira ticket `$ARGUMENTS`.

Workflow:

1. Load the context from `jira-intake`, `conventional-commit`, and `release-readiness`.
2. Find and read the ticket spec from `./specs/<functionality>/$ARGUMENTS.md`. If it does not exist yet, use the `ticket-planner` role to create it first.
3. Use the `coder` role to implement the required changes in the repository against that spec and note which acceptance criteria were covered.
4. Use the `reviewer` role to run the relevant lint, test, and build commands and fix issues if needed.
5. Keep the work aligned to ticket `$ARGUMENTS` and finish with a release-readiness note containing checks run, remaining risks, next action, and the spec path used.
