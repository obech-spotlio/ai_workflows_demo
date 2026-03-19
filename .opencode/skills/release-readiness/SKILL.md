---
name: release-readiness
description: Check whether a Jira-ticket change is ready to be committed and sent for review.
license: MIT
compatibility: opencode
metadata:
  audience: engineering
  workflow: qa
---

## Checklist

- Code changes align with ticket scope.
- Relevant tests were added or updated.
- Lint, tests, and build were run when supported.
- Any remaining risks are documented.
- Commit and PR messages mention the Jira ticket key.

## Output

- Ready / not ready
- Checks performed
- Remaining risks
- Recommended next action
