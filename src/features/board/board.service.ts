import { useBoardStore } from "@/features/board/store/board-store";
import type { Board } from "@/features/board/types/index";
import {
  createBoardSchema,
  updateBoardSchema,
  type CreateBoardInput,
  type UpdateBoardInput,
} from "@/features/board/types";

export function getBoards(): Board[] {
  return useBoardStore.getState().boards;
}

export function getBoard(id: string): Board | undefined {
  return useBoardStore.getState().boards.find((b) => b.id === id);
}

export function createBoard(input: CreateBoardInput): Board {
  const parsed = createBoardSchema.parse(input);
  const store = useBoardStore.getState();
  store.addBoard(parsed.title);
  const boards = useBoardStore.getState().boards;
  const board = boards[boards.length - 1];
  if (!board) {
    throw new Error("Failed to create board");
  }
  return board;
}

export function updateBoard(id: string, input: UpdateBoardInput): void {
  const parsed = updateBoardSchema.parse(input);
  useBoardStore.getState().updateBoard(id, parsed.title);
}

export function deleteBoard(id: string): void {
  useBoardStore.getState().deleteBoard(id);
}
