---
name: ticket-finish
description: Finalize a Jira ticket with QA, commit, push, and pull-request creation.
argument-hint: [JIRA-KEY]
---

Finish Jira ticket `$ARGUMENTS`.

Workflow:

1. Confirm the working tree changes belong to ticket `$ARGUMENTS` and read the ticket spec from `./specs/<functionality>/$ARGUMENTS.md`.
2. Use the `reviewer` role to perform final verification and report any release blockers against that spec.
3. Use the `publisher` role to create conventional commit messages that include the Jira key, push the current branch to origin, and open the pull request. Never push directly to `main` or `master`.
4. Return the branch name, commit message, verification summary, remaining risks, PR link or creation command, and spec path used.
