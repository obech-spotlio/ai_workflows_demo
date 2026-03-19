import { z } from "zod";

export const BoardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ColumnSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  title: z.string().min(1),
  position: z.number(),
  createdAt: z.string(),
});

export const CardSchema = z.object({
  id: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().default(""),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LabelSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const CardLabelSchema = z.object({
  cardId: z.string().uuid(),
  labelId: z.string().uuid(),
});

export type Board = z.infer<typeof BoardSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Card = z.infer<typeof CardSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type CardLabel = z.infer<typeof CardLabelSchema>;
