// Entity types (from data layer)
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

// Mutation-input types
export type {
  CreateBoardInput,
  UpdateBoardInput,
} from "@/features/board/types";
export {
  createBoardSchema,
  updateBoardSchema,
} from "@/features/board/types";

// Service
export {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from "@/features/board/board.service";

// Hooks
export { useBoards } from "@/features/board/hooks/use-boards";
export { useBoard } from "@/features/board/hooks/use-board";

// Components
export { BoardCard } from "@/features/board/components/board-card";
export { BoardList } from "@/features/board/components/board-list";
export { CreateBoardDialog } from "@/features/board/components/create-board-dialog";
export { BoardHeader } from "@/features/board/components/board-header";
