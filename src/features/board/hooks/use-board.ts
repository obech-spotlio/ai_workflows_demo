"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/features/board/store/board-store";
import {
  updateBoard as updateBoardService,
  deleteBoard as deleteBoardService,
} from "@/features/board/board.service";
import type { UpdateBoardInput } from "@/features/board/types";

export function useBoard(boardId: string) {
  const boards = useBoardStore((state) => state.boards);
  const loadBoards = useBoardStore((state) => state.loadBoards);

  const isLoading = boards.length === 0;

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const board = boards.find((b) => b.id === boardId);

  function updateBoard(input: UpdateBoardInput): void {
    updateBoardService(boardId, input);
  }

  function deleteBoard(): void {
    deleteBoardService(boardId);
  }

  return { board, updateBoard, deleteBoard, isLoading };
}
