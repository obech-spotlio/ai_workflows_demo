import { useBoardStore } from "@/features/board/store/board-store";
import type { Column } from "@/features/board/types/index";
import { readCards, removeKey, STORAGE_KEYS } from "@/shared/lib/storage/storage";
import {
  createColumnSchema,
  updateColumnSchema,
  type CreateColumnInput,
  type UpdateColumnInput,
} from "@/features/column/types";

export function getColumns(boardId: string): Column[] {
  return useBoardStore
    .getState()
    .columns.filter((c) => c.boardId === boardId)
    .sort((a, b) => a.position - b.position);
}

export function getColumn(id: string): Column | undefined {
  return useBoardStore.getState().columns.find((c) => c.id === id);
}

export function createColumn(
  boardId: string,
  input: CreateColumnInput,
): Column {
  const parsed = createColumnSchema.parse(input);
  const store = useBoardStore.getState();
  store.addColumn(boardId, parsed.title);
  const columns = useBoardStore
    .getState()
    .columns.filter((c) => c.boardId === boardId);
  const column = columns[columns.length - 1];
  if (!column) {
    throw new Error("Failed to create column");
  }
  return column;
}

export function updateColumn(id: string, input: UpdateColumnInput): void {
  const parsed = updateColumnSchema.parse(input);
  useBoardStore.getState().updateColumn(id, parsed.title);
}

export function deleteColumn(id: string): void {
  // Cascade: remove cards and card-labels for this column before removing column
  const cards = readCards(id);
  for (const card of cards) {
    removeKey(STORAGE_KEYS.cardLabels(card.id));
  }
  removeKey(STORAGE_KEYS.cards(id));

  useBoardStore.getState().deleteColumn(id);
}

export function reorderColumn(
  id: string,
  beforePos?: number,
  afterPos?: number,
): void {
  useBoardStore.getState().moveColumn(id, beforePos, afterPos);
}
