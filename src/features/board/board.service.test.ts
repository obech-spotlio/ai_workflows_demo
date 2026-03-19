import { beforeEach, describe, expect, it } from "vitest";
import { useBoardStore } from "@/features/board/store/board-store";
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from "@/features/board/board.service";

function resetStore() {
  useBoardStore.setState({
    boards: [],
    columns: [],
    cards: [],
    labels: [],
    cardLabels: [],
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

describe("board.service — getBoards", () => {
  it("returns empty array when no boards exist", () => {
    expect(getBoards()).toEqual([]);
  });

  it("returns boards from store state", () => {
    useBoardStore.getState().addBoard("Board A");
    expect(getBoards()).toHaveLength(1);
    expect(getBoards()[0]?.title).toBe("Board A");
  });
});

describe("board.service — getBoard", () => {
  it("returns undefined for unknown id", () => {
    expect(getBoard("nonexistent-id")).toBeUndefined();
  });

  it("returns the board matching the id", () => {
    useBoardStore.getState().addBoard("Board B");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();
    const board = getBoard(id!);
    expect(board?.title).toBe("Board B");
  });
});

describe("board.service — createBoard", () => {
  it("creates a board and returns it", () => {
    const board = createBoard({ title: "New Board" });
    expect(board.title).toBe("New Board");
    expect(board.id).toBeDefined();
    expect(getBoards()).toHaveLength(1);
  });

  it("throws on empty title", () => {
    expect(() => createBoard({ title: "" })).toThrow();
  });

  it("throws when title is missing (wrong shape)", () => {
    // @ts-expect-error intentionally bad input
    expect(() => createBoard({})).toThrow();
  });
});

describe("board.service — updateBoard", () => {
  it("updates the board title in store", () => {
    useBoardStore.getState().addBoard("Original");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();

    updateBoard(id!, { title: "Updated" });
    expect(getBoard(id!)?.title).toBe("Updated");
  });

  it("throws on empty title", () => {
    useBoardStore.getState().addBoard("Board");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();
    expect(() => updateBoard(id!, { title: "" })).toThrow();
  });
});

describe("board.service — deleteBoard", () => {
  it("removes the board from store", () => {
    useBoardStore.getState().addBoard("To Delete");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();

    deleteBoard(id!);
    expect(getBoards()).toHaveLength(0);
    expect(getBoard(id!)).toBeUndefined();
  });

  it("is a no-op for unknown id", () => {
    useBoardStore.getState().addBoard("Stays");
    deleteBoard("nonexistent-id");
    expect(getBoards()).toHaveLength(1);
  });
});
