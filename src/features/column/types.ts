import { z } from "zod";

// Re-export entity types from the data layer for convenience
export type { Column } from "@/features/board/types/index";
export { ColumnSchema } from "@/features/board/types/index";

// Mutation-input schemas
export const createColumnSchema = z.object({
  title: z.string().min(1).max(100),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(100),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
