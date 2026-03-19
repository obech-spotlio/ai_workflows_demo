# AI Agent Instructions — Kanban App

## Context for AI Agents

This document guides AI agents (Claude Code, Cursor, etc.) when working on this project.

## Architecture Quick Reference

- **Feature-sliced**: each domain lives in `src/features/{name}/`
- **Barrel exports**: always import from `@/features/{name}`, never internal files
- **Server-first**: components are Server Components by default
- **Service layer**: all data logic in `*.service.ts`
- **Mutations via Server Actions**: `*.actions.ts` files
- **Validation**: Zod schemas in `types.ts`, infer types with `z.infer<>`

## When Working on a Feature

1. **Read the feature folder first** — `src/features/{name}/` has everything you need
2. **Check types.ts** — Understand the domain before touching code
3. **Check index.ts** — Understand what is public and what is private
4. **Respect layer rules**:
   - `app/` imports from `features/` and `shared/`
   - `features/X` imports from `shared/` and `db/` (services only)
   - `features/X` does NOT import from `features/Y` internals (barrel only)
   - `shared/` does NOT import from `features/` or `app/`

## When Creating a New Component

1. Check if Stitch has a matching component: `stitch://components/{name}`
2. If yes → use the Stitch wrapper from `shared/ui/`
3. If no → create in the feature's `components/` folder
4. Use Stitch tokens (never hardcoded colors): `text-content-primary`, `bg-surface-secondary`
5. Support `className` prop with `cn()` for composability

## When Creating a New Feature

```
src/features/new-feature/
├── index.ts            # Barrel: export only the public API
├── types.ts            # Zod schemas + inferred types
├── new-feature.service.ts  # Data access (server-only)
├── new-feature.actions.ts  # Server actions (mutations)
├── use-new-feature.ts      # Client hook
├── components/
│   └── ...
└── __tests__/
    └── ...
```

## When Modifying the Database

1. Edit `src/db/schema.ts`
2. Run `pnpm db:push` (dev) or generate migration `pnpm db:migrate`
3. Update the corresponding feature's `types.ts` if the Zod schema changed
4. Update the service layer to use new fields

## When Writing Tests

- Co-locate tests in `__tests__/` within the feature
- Test behavior, not implementation
- Name: `describe("service-name")` + `it("does specific thing")`
- Mock only external boundaries (db, fetch), not internal modules

## Common Patterns to Follow

### Adding a CRUD feature

1. Define Zod schemas in `types.ts`
2. Write service functions in `*.service.ts`
3. Write server actions in `*.actions.ts`
4. Write API route handlers in `app/api/`
5. Write client hooks in `use-*.ts`
6. Build components in `components/`
7. Wire up in `app/` page
8. Write tests in `__tests__/`

### Adding a new UI component

1. Check Stitch MCP for existing component spec
2. If Stitch has it → add wrapper to `shared/ui/`
3. Use `cva()` for variants, `cn()` for class merging
4. Export from `shared/ui/index.ts`

### Modifying drag-and-drop behavior

1. DnD logic lives in `features/card/use-card-dnd.ts`
2. DnD context lives in `features/kanban/kanban-dnd-context.tsx`
3. Always implement optimistic updates (see coding guidelines)
4. Test with keyboard navigation too (a11y)

## Do NOT

- Import from feature internals (use barrel exports)
- Add hardcoded colors or magic numbers
- Skip Zod validation on API boundaries
- Use `any` or `as` casts without justification
- Create global state stores for server data (use TanStack Query)
- Add `"use client"` to components that don't need interactivity
- Create `utils/` or `helpers/` dump folders (put logic in the feature)
