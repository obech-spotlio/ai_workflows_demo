import { z } from "zod";
import {
  Board,
  BoardSchema,
  Card,
  CardLabel,
  CardLabelSchema,
  CardSchema,
  Column,
  ColumnSchema,
  Label,
  LabelSchema,
} from "@/features/board/types";

export const STORAGE_KEYS = {
  boards: "kanban:boards",
  columns: (boardId: string) => `kanban:columns:${boardId}`,
  cards: (columnId: string) => `kanban:cards:${columnId}`,
  labels: (boardId: string) => `kanban:labels:${boardId}`,
  cardLabels: (cardId: string) => `kanban:card-labels:${cardId}`,
} as const;

export function readCollection<T>(key: string, schema: z.ZodType<T>): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const results: T[] = [];
    for (const item of parsed) {
      const result = schema.safeParse(item);
      if (result.success) {
        results.push(result.data);
      }
    }
    return results;
  } catch {
    return [];
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function readBoards(): Board[] {
  return readCollection(STORAGE_KEYS.boards, BoardSchema);
}

export function writeBoards(boards: Board[]): void {
  writeCollection(STORAGE_KEYS.boards, boards);
}

export function readColumns(boardId: string): Column[] {
  return readCollection(STORAGE_KEYS.columns(boardId), ColumnSchema);
}

export function writeColumns(boardId: string, columns: Column[]): void {
  writeCollection(STORAGE_KEYS.columns(boardId), columns);
}

export function readCards(columnId: string): Card[] {
  return readCollection(STORAGE_KEYS.cards(columnId), CardSchema);
}

export function writeCards(columnId: string, cards: Card[]): void {
  writeCollection(STORAGE_KEYS.cards(columnId), cards);
}

export function readLabels(boardId: string): Label[] {
  return readCollection(STORAGE_KEYS.labels(boardId), LabelSchema);
}

export function writeLabels(boardId: string, labels: Label[]): void {
  writeCollection(STORAGE_KEYS.labels(boardId), labels);
}

export function readCardLabels(cardId: string): CardLabel[] {
  return readCollection(STORAGE_KEYS.cardLabels(cardId), CardLabelSchema);
}

export function writeCardLabels(cardId: string, cardLabels: CardLabel[]): void {
  writeCollection(STORAGE_KEYS.cardLabels(cardId), cardLabels);
}

export function removeKey(key: string): void {
  localStorage.removeItem(key);
}

export function clearAll(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null && key.startsWith("kanban:")) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
