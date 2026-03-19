---
name: conventional-commit
description: Produce conventional commit messages that include a Jira ticket key.
---

## Rules

- Format: `<type>(<scope>): <TICKET> <summary>`
- Scope is optional.
- Ticket key is mandatory.
- Keep the summary imperative and concise.

## Allowed types

- `feat`
- `fix`
- `chore`
- `docs`
- `refactor`
- `test`
- `build`
- `ci`
- `perf`

## Examples

- `feat(api): ABC-123 add retry policy for payment timeout`
- `fix(web): ABC-123 guard empty checkout state`
- `chore(repo): ABC-123 align CI branch filters`
