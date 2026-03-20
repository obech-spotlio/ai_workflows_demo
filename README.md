# AI Workflows Demo

Demo repository for taking Jira work through to pull request using specialized agents, persisted handoffs, and workflow guardrails. The project combines a lightweight Next.js app with an AI-assisted delivery workflow for Codex and Claude.

## Overview

This repository brings together two layers:

1. A frontend app built with `Next.js 15 + React 19 + TypeScript`.
2. An AI-assisted workflow that turns Jira work into a local spec, implementation, verification, and publication.

The main goal is not only to host an app, but to demonstrate a repeatable way of building with agents while keeping traceability between ticket scope, code changes, checks, and pull requests.

## What lives in this repo

| Path | Purpose |
| --- | --- |
| `src/` | Demo application code |
| `docs/` | Functional, technical, and workflow documentation |
| `specs/` | Persisted ticket handoffs in `specs/<functionality>/<ticket>.md` |
| `.codex/` | Workflow, agents, and skills used by Codex |
| `.claude/` | Equivalent Claude configuration, hooks, and audit logging |

## Current project state

- The product foundation is an evolving kanban-style application.
- The current codebase already includes a `boards` foundation, Vitest coverage, and a structure prepared to grow by feature area.
- Some documents under `docs/` describe the target architecture and conventions the repository is intended to follow as it evolves.

## Repository workflow

The official flow is `Jira -> local spec -> implementation -> verification -> pull request`.

### Entry points

| Command | Goal | Expected result |
| --- | --- | --- |
| `ticket-start ABC-123` | Analyze and prepare | Create `specs/<functionality>/ABC-123.md` and return the branch command |
| `ticket-implement ABC-123` | Implement and validate | Build against the persisted spec, run the smallest relevant checks, and leave a release-readiness note |
| `ticket-finish ABC-123` | Publish and request review | Verify, create a compliant commit, push the branch, and open or prepare the pull request |

### Stage contract

Each stage produces structured output that the next stage can use without rebuilding context from scratch:

| Stage | Required output |
| --- | --- |
| Intake | Spec with summary, acceptance criteria, constraints, risks, and branch slug |
| Implementation | Code changes and acceptance-criteria coverage tied back to the spec |
| Verification | Checks run, issues fixed, remaining risks, and recommendation |
| Publish | Final branch, commit, push result, and PR URL or PR creation command |

### Important rules

- Jira is the source of truth for scope and acceptance criteria.
- Jira is read-only from the agent workflow.
- Git operations are done through the CLI.
- Direct pushes to `main` or `master` are not allowed.
- Branch names must include the ticket key, for example `feature/ABC-123-short-description`.
- Commit messages must follow conventional commits and include the ticket key, for example `feat(api): ABC-123 add retry policy`.
- Pull request titles must begin with `[ABC-123]`.

## Subagents and responsibilities

The agents are designed as specialized roles, not generic assistants.

| Subagent | Role | Primary responsibility |
| --- | --- | --- |
| `ticket-planner` | Intake | Read Jira and branch context, synthesize scope, and persist the local spec |
| `coder` | Implementation | Make focused code and test changes against the spec |
| `reviewer` | Verification | Run relevant lint, test, and build checks and fix safe issues |
| `publisher` | Publish | Prepare branch, commit, push, and pull request creation |

### Which subagents run in each command

| Command | Subagent sequence |
| --- | --- |
| `ticket-start` | `ticket-planner` |
| `ticket-implement` | `ticket-planner -> coder -> reviewer` |
| `ticket-finish` | `reviewer -> publisher` |

### What each handoff does

- `ticket-planner` writes the local spec so implementation does not depend on conversational memory.
- `coder` uses that spec as the implementation contract and turns it into concrete repository changes.
- `reviewer` checks that the implementation still matches the spec and leaves any residual risks explicit.
- `publisher` reuses the spec and verification context to prepare the commit and PR messaging.

## Specs as the local source of truth

Specs are stored in:

```text
specs/<functionality>/<ticket-key>.md
```

Examples:

```text
specs/payments/ABC-123.md
specs/checkout/ABC-124.md
```

This allows multiple agents to work consistently from the same ticket handoff, even across sessions or tools.

## Recommended documentation

Use this `README` as the entry point, then jump to the more specific document for the task at hand:

| Document | When to read it |
| --- | --- |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | To understand the full Jira -> PR flow, guardrails, hooks, and permissions |
| [`docs/architecture.md`](docs/architecture.md) | To understand the target application architecture and layer boundaries |
| [`docs/ai_agent_instructions.md`](docs/ai_agent_instructions.md) | To guide agents on patterns, imports, and feature structure |
| [`docs/coding_guidelines.md`](docs/coding_guidelines.md) | For TypeScript, component, service, action, and testing conventions |
| [`docs/design_system.md`](docs/design_system.md) | For visual decisions and design system usage |
| [`docs/setup.md`](docs/setup.md) | For setup expectations and environment guidance |
| [`specs/README.md`](specs/README.md) | For spec storage and naming rules |

## Quick structure

```text
.
├── src/              # Next.js application
├── docs/             # Product, architecture, and workflow documentation
├── specs/            # Persisted ticket handoffs
├── .codex/           # Codex agents and skills
└── .claude/          # Claude hooks, agents, and logs
```

## Local development

Available scripts in the repository today:

```bash
npm run dev
npm run lint
npm test
npm run build
```

The app runs at `http://localhost:3000`.

## How to work in this repo

If you are making code changes:

1. Read this `README`.
2. Read [`docs/WORKFLOW.md`](docs/WORKFLOW.md) if the change starts from a ticket.
3. Read [`docs/architecture.md`](docs/architecture.md) and [`docs/coding_guidelines.md`](docs/coding_guidelines.md) before changing structure or patterns.
4. If a ticket spec already exists, use it as the primary reference before implementing.

## Summary

This repository is built to demonstrate an agent-assisted delivery flow with real traceability: Jira defines the scope, a local spec fixes the handoff, specialized subagents execute each stage, and the result ends in a reviewable pull request.
