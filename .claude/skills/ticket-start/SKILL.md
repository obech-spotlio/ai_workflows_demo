---
name: ticket-start
description: Start a Jira ticket workflow by analyzing the ticket and preparing the branch plan.
argument-hint: [JIRA-KEY]
disable-model-invocation: true
---

Start work for Jira ticket `$ARGUMENTS`.

Workflow:

1. Use the `ticket-planner` subagent to read the Jira ticket and acceptance criteria via MCP.
2. Inspect existing branches via `git branch -r` to spot naming conventions or existing work.
3. Derive a functionality slug and write the planning handoff to `./specs/<functionality>/$ARGUMENTS.md`.
4. The spec must include ticket summary, acceptance criteria checklist, implementation approach, dependencies, risks, open questions, and suggested branch slug.
5. Recommend a branch name in the format `feature/$ARGUMENTS-short-description` unless the ticket is clearly a bug or chore.
6. Check the current branch and suggest the exact `git switch -c ...` command, but do not commit or push anything.
