"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/features/board/store/board-store";
import { createBoard, deleteBoard as deleteBoardService } from "@/features/board/board.service";
import type { Board } from "@/features/board/types/index";
import type { CreateBoardInput } from "@/features/board/types";

export function useBoards() {
  const boards = useBoardStore((state) => state.boards);
  const loadBoards = useBoardStore((state) => state.loadBoards);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  function addBoard(input: CreateBoardInput): Board {
    return createBoard(input);
  }

  function deleteBoard(id: string): void {
    deleteBoardService(id);
  }

  return { boards, addBoard, deleteBoard };
}
