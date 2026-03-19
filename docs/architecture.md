# Architecture — Kanban App

## Overview

Kanban management application built with Next.js 15 (App Router), using a **feature-sliced** architecture optimized for AI-assisted development.

## Why Feature-Sliced Architecture

Feature-grouped architecture maximizes AI agent efficiency because:

- **Context locality** — all files for a feature (components, hooks, types, services, tests) are co-located. The agent does not need to traverse the entire tree to understand the domain.
- **Explicit boundaries** — each feature exposes a barrel export (`index.ts`). Dependencies between features are visible and intentional.
- **Reduced scope** — when a ticket targets a feature, the agent can read only that folder and have 90% of the necessary context.
- **Safe parallelism** — two agents can work on different features with minimal risk of conflicts.

## Directory Structure

```
kanban-app/
├── src/
│   ├── app/                          # Next.js App Router (routing only)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing / redirect
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Sidebar + header shell
│   │   │   ├── boards/
│   │   │   │   ├── page.tsx          # Board list
│   │   │   │   └── [boardId]/
│   │   │   │       ├── page.tsx      # Board detail (kanban view)
│   │   │   │       └── settings/page.tsx
│   │   │   └── settings/page.tsx     # User settings
│   │   └── api/                      # Route handlers
│   │       ├── boards/route.ts
│   │       ├── boards/[boardId]/route.ts
│   │       ├── columns/route.ts
│   │       ├── cards/route.ts
│   │       └── auth/[...nextauth]/route.ts
│   │
│   ├── features/                     # Feature modules (core domain)
│   │   ├── board/
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── types.ts              # Board, BoardSummary
│   │   │   ├── board.service.ts      # Server-side data access
│   │   │   ├── board.actions.ts      # Server actions
│   │   │   ├── use-boards.ts         # Client hook (list)
│   │   │   ├── use-board.ts          # Client hook (single)
│   │   │   ├── components/
│   │   │   │   ├── board-card.tsx
│   │   │   │   ├── board-list.tsx
│   │   │   │   ├── create-board-dialog.tsx
│   │   │   │   └── board-header.tsx
│   │   │   └── __tests__/
│   │   │       ├── board.service.test.ts
│   │   │       └── board-card.test.tsx
│   │   │
│   │   ├── column/
│   │   │   ├── index.ts
│   │   │   ├── types.ts              # Column
│   │   │   ├── column.service.ts
│   │   │   ├── column.actions.ts
│   │   │   ├── use-columns.ts
│   │   │   ├── components/
│   │   │   │   ├── column.tsx
│   │   │   │   ├── column-header.tsx
│   │   │   │   └── add-column.tsx
│   │   │   └── __tests__/
│   │   │
│   │   ├── card/
│   │   │   ├── index.ts
│   │   │   ├── types.ts              # Card, CardPriority, CardLabel
│   │   │   ├── card.service.ts
│   │   │   ├── card.actions.ts
│   │   │   ├── use-cards.ts
│   │   │   ├── use-card-dnd.ts       # Drag-and-drop logic
│   │   │   ├── components/
│   │   │   │   ├── card.tsx
│   │   │   │   ├── card-detail.tsx
│   │   │   │   ├── card-form.tsx
│   │   │   │   └── card-labels.tsx
│   │   │   └── __tests__/
│   │   │
│   │   ├── kanban/                    # Orchestration feature
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── use-kanban.ts          # Composes board + columns + cards
│   │   │   ├── kanban-dnd-context.tsx
│   │   │   ├── components/
│   │   │   │   └── kanban-board.tsx   # Full board composition
│   │   │   └── __tests__/
│   │   │
│   │   └── auth/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── auth.config.ts         # NextAuth config
│   │       ├── auth.service.ts
│   │       ├── use-session.ts
│   │       ├── components/
│   │       │   ├── login-form.tsx
│   │       │   ├── register-form.tsx
│   │       │   └── user-menu.tsx
│   │       └── __tests__/
│   │
│   ├── shared/                        # Cross-cutting, feature-agnostic
│   │   ├── ui/                        # Design system wrappers (from Stitch MCP)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts          # Typed fetch wrapper
│   │   │   ├── cn.ts                  # clsx + twMerge
│   │   │   ├── constants.ts
│   │   │   └── validators.ts          # Shared Zod schemas
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-local-storage.ts
│   │   │   └── use-media-query.ts
│   │   └── providers/
│   │       ├── query-provider.tsx      # TanStack Query
│   │       ├── theme-provider.tsx
│   │       └── toast-provider.tsx
│   │
│   └── db/                            # Database layer
│       ├── schema.ts                  # Drizzle schema
│       ├── migrations/
│       ├── client.ts                  # DB connection
│       └── seed.ts
│
├── public/
├── docs/                              # This documentation
├── .stitch/                           # Stitch MCP design tokens cache
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

## Layer Rules

| Layer        | Can import from                           | Cannot import from                     |
| ------------ | ----------------------------------------- | -------------------------------------- |
| `app/`       | `features/*`, `shared/*`                  | `db/` directly                         |
| `features/X` | `shared/*`, `db/` (only in `.service.ts`) | Other `features/Y` (except via barrel) |
| `shared/`    | External libraries only                   | `features/*`, `app/`, `db/`            |
| `db/`        | External libraries only                   | Everything else                        |

### Feature inter-dependency

When a feature needs data from another (e.g., `kanban` needs `board`, `column`, `card`), it imports only from the barrel (`features/board`), never from internal files. The `kanban` feature is the only module that orchestrates multiple features.

## Data Flow

```
Browser
  │
  ├── Server Component (RSC)
  │     └── feature.service.ts → db/ (Drizzle) → PostgreSQL
  │
  ├── Client Component
  │     └── use-feature.ts → TanStack Query → /api/route.ts
  │           └── feature.service.ts → db/
  │
  └── Server Action (mutations)
        └── feature.actions.ts → feature.service.ts → db/
```

## Key Patterns

### 1. Service Layer

All data logic lives in `*.service.ts`. Services are pure functions that receive parameters and return typed data. They have no knowledge of React.

### 2. Server Actions for Mutations

Mutations (create, update, delete) use Server Actions (`*.actions.ts`) with `revalidatePath`/`revalidateTag` to invalidate cache.

### 3. TanStack Query for Client State

The `use-*.ts` hooks wrap TanStack Query for client-side fetching with cache, optimistic updates, and deduplication.

### 4. Optimistic Updates for DnD

Drag-and-drop updates the local state immediately and syncs with the server in the background. If it fails, it reverts.

## Tech Stack

| Concern        | Choice                         | Reason                                       |
| -------------- | ------------------------------ | -------------------------------------------- |
| Framework      | Next.js 15 (App Router)        | RSC + Server Actions + Edge                  |
| Language       | TypeScript 5.x (strict)        | Type safety                                  |
| Styling        | Tailwind CSS 4                 | Utility-first, Stitch-compatible             |
| UI Components  | Stitch Design System (via MCP) | Corporate design system                      |
| State (server) | TanStack Query v5              | Cache + optimistic updates                   |
| State (client) | Zustand (minimal)              | Only for local UI state (sidebar open, etc.) |
| DnD            | @dnd-kit/core                  | Accessible, performant                       |
| Database       | PostgreSQL + Drizzle ORM       | Type-safe SQL                                |
| Auth           | NextAuth.js v5                 | OAuth + credentials                          |
| Validation     | Zod                            | Runtime type validation                      |
| Testing        | Vitest + Testing Library       | Fast, ESM-native                             |
| Linting        | ESLint + Prettier              | Consistency                                  |
