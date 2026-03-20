import { z } from "zod";

// Re-export all entity types so that `@/features/board/types` resolves correctly
// for consumers that previously relied on the `types/` directory index.
export type {
  Board,
  Column,
  Card,
  Label,
  CardLabel,
} from "@/features/board/types/index";
export {
  BoardSchema,
  ColumnSchema,
  CardSchema,
  LabelSchema,
  CardLabelSchema,
} from "@/features/board/types/index";

// Mutation-input schemas
export const createBoardSchema = z.object({
  title: z.string().min(1),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
