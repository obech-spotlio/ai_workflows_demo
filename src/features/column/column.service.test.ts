import { beforeEach, describe, expect, it } from "vitest";
import { useBoardStore } from "@/features/board/store/board-store";
import {
  getColumns,
  getColumn,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
} from "@/features/column/column.service";

function resetStore() {
  useBoardStore.setState({
    boards: [],
    columns: [],
    cards: [],
    labels: [],
    cardLabels: [],
  });
}

const BOARD_ID = "b0000000-0000-4000-8000-000000000001";

beforeEach(() => {
  localStorage.clear();
  resetStore();
  // Seed a board so addColumn works
  useBoardStore.getState().addBoard("Test Board");
  const boards = useBoardStore.getState().boards;
  const board = boards[0];
  if (board) {
    // Override the board id for predictable references
    useBoardStore.setState({
      boards: [{ ...board, id: BOARD_ID }],
    });
  }
});

describe("column.service — getColumns", () => {
  it("returns empty array when no columns exist for board", () => {
    expect(getColumns(BOARD_ID)).toEqual([]);
  });

  it("returns columns filtered by boardId, sorted by position", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Column A");
    useBoardStore.getState().addColumn(BOARD_ID, "Column B");
    const columns = getColumns(BOARD_ID);
    expect(columns).toHaveLength(2);
    expect(columns[0]?.position).toBeLessThanOrEqual(columns[1]?.position ?? Infinity);
  });

  it("does not return columns belonging to other boards", () => {
    const OTHER_BOARD = "b0000000-0000-4000-8000-000000000099";
    useBoardStore.setState({
      boards: [
        ...useBoardStore.getState().boards,
        {
          id: OTHER_BOARD,
          title: "Other",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    useBoardStore.getState().addColumn(OTHER_BOARD, "Other Column");
    expect(getColumns(BOARD_ID)).toHaveLength(0);
  });
});

describe("column.service — getColumn", () => {
  it("returns undefined for unknown id", () => {
    expect(getColumn("nonexistent-id")).toBeUndefined();
  });

  it("returns the column matching the id", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "My Column");
    const columns = useBoardStore.getState().columns;
    const id = columns[0]?.id;
    expect(id).toBeDefined();
    const col = getColumn(id!);
    expect(col?.title).toBe("My Column");
  });
});

describe("column.service — createColumn", () => {
  it("creates a column and returns it", () => {
    const col = createColumn(BOARD_ID, { title: "New Column" });
    expect(col.title).toBe("New Column");
    expect(col.boardId).toBe(BOARD_ID);
    expect(col.id).toBeDefined();
    expect(getColumns(BOARD_ID)).toHaveLength(1);
  });

  it("assigns a positive position", () => {
    const col = createColumn(BOARD_ID, { title: "Positioned" });
    expect(col.position).toBeGreaterThan(0);
  });

  it("throws on empty title", () => {
    expect(() => createColumn(BOARD_ID, { title: "" })).toThrow();
  });

  it("throws on title exceeding 100 characters", () => {
    expect(() => createColumn(BOARD_ID, { title: "a".repeat(101) })).toThrow();
  });
});

describe("column.service — updateColumn", () => {
  it("renames the column in the store", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Original");
    const id = useBoardStore.getState().columns[0]?.id;
    expect(id).toBeDefined();

    updateColumn(id!, { title: "Renamed" });
    expect(getColumn(id!)?.title).toBe("Renamed");
  });

  it("throws on empty title", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Column");
    const id = useBoardStore.getState().columns[0]?.id;
    expect(id).toBeDefined();
    expect(() => updateColumn(id!, { title: "" })).toThrow();
  });
});

describe("column.service — deleteColumn", () => {
  it("removes the column from the store", () => {
    createColumn(BOARD_ID, { title: "To Delete" });
    const id = useBoardStore.getState().columns[0]?.id;
    expect(id).toBeDefined();

    deleteColumn(id!);
    expect(getColumns(BOARD_ID)).toHaveLength(0);
    expect(getColumn(id!)).toBeUndefined();
  });

  it("is a no-op for unknown id", () => {
    createColumn(BOARD_ID, { title: "Stays" });
    deleteColumn("nonexistent-id");
    expect(getColumns(BOARD_ID)).toHaveLength(1);
  });

  it("cascades: clears cards from localStorage for the column", () => {
    const col = createColumn(BOARD_ID, { title: "With Cards" });
    // Add a card to the column
    useBoardStore.getState().addCard(col.id, "Card 1");
    // Verify card was written to localStorage
    expect(localStorage.getItem(`kanban:cards:${col.id}`)).not.toBeNull();

    deleteColumn(col.id);

    // After deletion the cards key should be gone
    expect(localStorage.getItem(`kanban:cards:${col.id}`)).toBeNull();
  });
});

describe("column.service — reorderColumn", () => {
  it("changes the column position (append: between two)", () => {
    createColumn(BOARD_ID, { title: "A" });
    createColumn(BOARD_ID, { title: "B" });
    createColumn(BOARD_ID, { title: "C" });

    const [colA, colB, colC] = getColumns(BOARD_ID);
    expect(colA).toBeDefined();
    expect(colB).toBeDefined();
    expect(colC).toBeDefined();

    // Move C between A and B
    reorderColumn(colC!.id, colA!.position, colB!.position);

    const reordered = getColumns(BOARD_ID);
    const titles = reordered.map((c) => c.title);
    // C should now come before B
    expect(titles.indexOf("C")).toBeLessThan(titles.indexOf("B"));
  });

  it("handles prepend (no beforePos)", () => {
    createColumn(BOARD_ID, { title: "First" });
    createColumn(BOARD_ID, { title: "Second" });

    const [first, second] = getColumns(BOARD_ID);
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    // Move Second to the front (no beforePos, afterPos = first.position)
    reorderColumn(second!.id, undefined, first!.position);

    const reordered = getColumns(BOARD_ID);
    expect(reordered[0]?.title).toBe("Second");
  });
});
