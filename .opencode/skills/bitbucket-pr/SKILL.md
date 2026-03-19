---
name: bitbucket-pr
description: Draft and create a Bitbucket pull request for a Jira ticket workflow.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: bitbucket
---

## PR title

- Format: `[TICKET] concise summary`

## PR body template

### Summary

- What changed and why

### Verification

- Lint
- Tests
- Build

### Acceptance Criteria

- Map each Jira acceptance criterion to the implemented behavior

### Risks

- Known limitations, rollout notes, or follow-up work

## Rules

- Create the PR only after branch push succeeds.
- Do not modify existing PRs.
- Do not merge or approve PRs.
