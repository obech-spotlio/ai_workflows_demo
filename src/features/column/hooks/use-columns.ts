"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/features/board/store/board-store";
import type { Column } from "@/features/board/types/index";
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
} from "@/features/column/column.service";

export function useColumns(boardId: string) {
  const columns: Column[] = useBoardStore((state) =>
    state.columns
      .filter((c) => c.boardId === boardId)
      .sort((a, b) => a.position - b.position),
  );

  const loadColumns = useBoardStore((state) => state.loadColumns);

  useEffect(() => {
    loadColumns(boardId);
  }, [loadColumns, boardId]);

  function addColumn(title: string): Column {
    return createColumn(boardId, { title });
  }

  function renameColumn(id: string, title: string): void {
    updateColumn(id, { title });
  }

  function removeColumn(id: string): void {
    deleteColumn(id);
  }

  function moveColumn(id: string, beforePos?: number, afterPos?: number): void {
    reorderColumn(id, beforePos, afterPos);
  }

  return { columns, addColumn, renameColumn, removeColumn, moveColumn };
}
