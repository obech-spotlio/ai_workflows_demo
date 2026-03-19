# Coding Guidelines — Kanban App

## TypeScript

### Strict mode always

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
  },
}
```

### Types live in the feature

Each feature defines its types in `types.ts`. There is no global `types/` directory.

```typescript
// features/card/types.ts
export type CardPriority = "low" | "medium" | "high" | "urgent";

export interface Card {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  position: number;
  priority: CardPriority;
  labels: string[];
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Prefer `interface` for objects, `type` for unions/intersections

```typescript
// Good
interface Board {
  id: string;
  name: string;
}

type BoardOrNull = Board | null;

// Avoid
type Board = {
  id: string;
  name: string;
};
```

### Zod as single source of truth for validation

Define Zod schemas, infer TypeScript types from them.

```typescript
// features/card/types.ts
import { z } from "zod";

export const createCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  columnId: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
```

## Components

### Server Components by default

Every component is a Server Component unless it needs interactivity.

```typescript
// features/board/components/board-list.tsx (Server Component — no "use client")
import { getBoards } from "../board.service";
import { BoardCard } from "./board-card";

export async function BoardList() {
  const boards = await getBoards();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
```

### Client Components: small and focused

Extract only the interactive part as a Client Component.

```typescript
// features/board/components/create-board-dialog.tsx
"use client";

import { useState } from "react";
import { Button, Dialog, Input } from "@/shared/ui";
import { createBoard } from "../board.actions";

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  // ...minimal client logic
}
```

### Naming conventions

| Item             | Convention                        | Example                       |
| ---------------- | --------------------------------- | ----------------------------- |
| Component file   | kebab-case                        | `board-card.tsx`              |
| Component export | PascalCase                        | `export function BoardCard()` |
| Hook file        | kebab-case with `use-` prefix     | `use-boards.ts`               |
| Hook export      | camelCase with `use` prefix       | `export function useBoards()` |
| Service file     | kebab-case with `.service` suffix | `board.service.ts`            |
| Action file      | kebab-case with `.actions` suffix | `board.actions.ts`            |
| Test file        | mirror source with `.test` suffix | `board.service.test.ts`       |
| Type file        | `types.ts` per feature            | `features/board/types.ts`     |
| Barrel export    | `index.ts` per feature            | `features/board/index.ts`     |

### Component structure

```typescript
// 1. Imports (external → internal → relative)
import { Suspense } from "react";
import { cn } from "@/shared/lib/cn";
import type { Board } from "../types";

// 2. Types (if component-specific, otherwise in types.ts)
interface BoardCardProps {
  board: Board;
  className?: string;
}

// 3. Component (named export, never default)
export function BoardCard({ board, className }: BoardCardProps) {
  return (
    <article className={cn("rounded-lg border p-4", className)}>
      <h3>{board.name}</h3>
    </article>
  );
}
```

## Services & Actions

### Services: pure data access

```typescript
// features/board/board.service.ts
import { db } from "@/db/client";
import { boards } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Board } from "./types";

export async function getBoardById(id: string): Promise<Board | null> {
  const result = await db.query.boards.findFirst({
    where: eq(boards.id, id),
  });
  return result ?? null;
}

export async function getBoards(): Promise<Board[]> {
  return db.query.boards.findMany({
    orderBy: (boards, { desc }) => [desc(boards.updatedAt)],
  });
}
```

### Server Actions: mutation + revalidation

```typescript
// features/board/board.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createBoardSchema } from "./types";
import { createBoardInDb } from "./board.service";

export async function createBoard(formData: FormData) {
  const parsed = createBoardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const board = await createBoardInDb(parsed.data);
  revalidatePath("/boards");
  return { data: board };
}
```

## Hooks

### TanStack Query pattern

```typescript
// features/board/use-boards.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { Board } from "./types";

export function useBoards() {
  return useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => fetch("/api/boards").then((res) => res.json()),
  });
}
```

### Optimistic updates for DnD

```typescript
// features/card/use-card-dnd.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Card } from "./types";

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { cardId: string; toColumnId: string; position: number }) =>
      fetch(`/api/cards/${args.cardId}/move`, {
        method: "PATCH",
        body: JSON.stringify(args),
      }),
    onMutate: async ({ cardId, toColumnId, position }) => {
      await queryClient.cancelQueries({ queryKey: ["cards"] });
      const previous = queryClient.getQueryData<Card[]>(["cards"]);

      queryClient.setQueryData<Card[]>(["cards"], (old) =>
        old?.map((card) =>
          card.id === cardId ? { ...card, columnId: toColumnId, position } : card
        )
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cards"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}
```

## Styling

### Tailwind + Stitch Design System

Stitch tokens (colors, spacing, typography, radii) are synced via MCP and mapped to the Tailwind config.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { stitchPreset } from "./.stitch/tailwind-preset";

export default {
  presets: [stitchPreset],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Project-specific overrides only
    },
  },
} satisfies Config;
```

### Class ordering

Follow logical order: layout → sizing → spacing → visual → interactive → responsive.

```tsx
<div className="bg-surface-primary hover:bg-surface-hover flex items-center gap-2 rounded-lg border p-4 md:gap-4" />
```

### No inline styles

Always use Tailwind utilities. If a dynamic value is needed, use CSS variables.

```tsx
// Good
<div style={{ "--column-count": columns.length } as React.CSSProperties}
     className="grid grid-cols-[repeat(var(--column-count),320px)]" />

// Avoid
<div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 320px)` }} />
```

## Testing

### Test co-location

Tests live in `__tests__/` within each feature.

### What to test

| Layer      | What                      | Tool                     |
| ---------- | ------------------------- | ------------------------ |
| Services   | Data logic, edge cases    | Vitest (unit)            |
| Actions    | Validation, revalidation  | Vitest (unit, mock db)   |
| Components | User-visible behavior     | Vitest + Testing Library |
| Kanban DnD | Drag sequences            | Vitest + Testing Library |
| API Routes | Request/response contract | Vitest (integration)     |

### Test naming

```typescript
describe("board.service", () => {
  it("returns null when board does not exist", async () => { ... });
  it("returns boards ordered by updatedAt descending", async () => { ... });
});
```

### No implementation testing

Test behavior, not implementation. Do not test that a function was called X times or internal state.

## Error Handling

### Boundaries, not try-catch everywhere

- Use `error.tsx` at route segment level for unexpected errors.
- Use Zod `.safeParse()` for validation errors — return structured errors, don't throw.
- Services may throw for truly exceptional cases (db connection lost). Let the boundary catch.

```typescript
// app/(dashboard)/boards/[boardId]/error.tsx
"use client";

export default function BoardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <p>Something went wrong loading this board.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Barrel Exports

Each feature exposes an `index.ts` that acts as its public API.

```typescript
// features/board/index.ts
export type { Board, BoardSummary, CreateBoardInput } from "./types";
export { BoardList } from "./components/board-list";
export { BoardCard } from "./components/board-card";
export { CreateBoardDialog } from "./components/create-board-dialog";
export { useBoards } from "./use-boards";
export { useBoard } from "./use-board";
```

Rule: if it's not in the barrel, it's private to the feature.

## Import Aliases

```jsonc
// tsconfig.json paths
{
  "paths": {
    "@/*": ["./src/*"],
  },
}
```

Usage:

```typescript
import { Button } from "@/shared/ui";
import { useBoards } from "@/features/board";
import { db } from "@/db/client";
```

## Git & Commits

- Branch: `feature/TICKET-123-short-description`
- Commits: `feat(board): TICKET-123 add create board dialog`
- Conventional commits prefixes: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- One logical change per commit
- PR title: `[TICKET-123] Add create board dialog`
