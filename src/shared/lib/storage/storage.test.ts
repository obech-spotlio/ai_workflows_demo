import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  clearAll,
  readBoards,
  readCardLabels,
  readCards,
  readCollection,
  readColumns,
  readLabels,
  STORAGE_KEYS,
  writeBoards,
  writeCardLabels,
  writeCards,
  writeCollection,
  writeColumns,
  writeLabels,
} from "@/shared/lib/storage/storage";
import type { Board, Card, CardLabel, Column, Label } from "@/features/board/types";

const FIXED_UUID = "00000000-0000-4000-8000-000000000001";
const FIXED_UUID_2 = "00000000-0000-4000-8000-000000000002";
const NOW = "2024-01-01T00:00:00.000Z";

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: FIXED_UUID,
    title: "Test Board",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: FIXED_UUID,
    boardId: FIXED_UUID,
    title: "Test Column",
    position: 1000,
    createdAt: NOW,
    ...overrides,
  };
}

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: FIXED_UUID,
    columnId: FIXED_UUID,
    title: "Test Card",
    description: "",
    position: 1000,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeLabel(overrides: Partial<Label> = {}): Label {
  return {
    id: FIXED_UUID,
    boardId: FIXED_UUID,
    name: "Bug",
    color: "#FF0000",
    ...overrides,
  };
}

function makeCardLabel(overrides: Partial<CardLabel> = {}): CardLabel {
  return {
    cardId: FIXED_UUID,
    labelId: FIXED_UUID_2,
    ...overrides,
  };
}

describe("readCollection", () => {
  beforeEach(() => localStorage.clear());

  it("returns empty array for missing key", () => {
    expect(readCollection("nonexistent", z.object({ x: z.number() }))).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    localStorage.setItem("bad", "not-json");
    expect(readCollection("bad", z.object({ x: z.number() }))).toEqual([]);
  });

  it("returns empty array when value is not an array", () => {
    localStorage.setItem("obj", JSON.stringify({ not: "array" }));
    expect(readCollection("obj", z.object({ not: z.string() }))).toEqual([]);
  });

  it("filters out items that fail schema validation", () => {
    const schema = z.object({ id: z.string().uuid(), value: z.number() });
    const data = [
      { id: FIXED_UUID, value: 42 },
      { id: "not-a-uuid", value: 99 }, // invalid
      { id: FIXED_UUID_2, value: 7 },
    ];
    localStorage.setItem("test", JSON.stringify(data));
    const result = readCollection("test", schema);
    expect(result).toHaveLength(2);
    expect(result[0]?.value).toBe(42);
    expect(result[1]?.value).toBe(7);
  });

  it("returns all valid items", () => {
    const schema = z.object({ n: z.number() });
    localStorage.setItem("nums", JSON.stringify([{ n: 1 }, { n: 2 }]));
    expect(readCollection("nums", schema)).toEqual([{ n: 1 }, { n: 2 }]);
  });
});

describe("writeCollection", () => {
  beforeEach(() => localStorage.clear());

  it("persists data to localStorage", () => {
    writeCollection("mykey", [{ a: 1 }]);
    expect(localStorage.getItem("mykey")).toBe('[{"a":1}]');
  });

  it("persists empty array", () => {
    writeCollection("empty", []);
    expect(localStorage.getItem("empty")).toBe("[]");
  });
});

describe("Boards", () => {
  beforeEach(() => localStorage.clear());

  it("readBoards returns empty array when nothing stored", () => {
    expect(readBoards()).toEqual([]);
  });

  it("writeBoards and readBoards round-trip", () => {
    const board = makeBoard();
    writeBoards([board]);
    expect(readBoards()).toEqual([board]);
  });

  it("readBoards filters out invalid boards", () => {
    localStorage.setItem(
      STORAGE_KEYS.boards,
      JSON.stringify([{ id: "bad", title: "" }]),
    );
    expect(readBoards()).toEqual([]);
  });
});

describe("Columns", () => {
  const boardId = FIXED_UUID;
  beforeEach(() => localStorage.clear());

  it("readColumns returns empty array when nothing stored", () => {
    expect(readColumns(boardId)).toEqual([]);
  });

  it("writeColumns and readColumns round-trip", () => {
    const col = makeColumn({ boardId });
    writeColumns(boardId, [col]);
    expect(readColumns(boardId)).toEqual([col]);
  });

  it("uses boardId-scoped key", () => {
    const col = makeColumn({ boardId });
    writeColumns(boardId, [col]);
    expect(readColumns(FIXED_UUID_2)).toEqual([]);
  });
});

describe("Cards", () => {
  const columnId = FIXED_UUID;
  beforeEach(() => localStorage.clear());

  it("readCards returns empty array when nothing stored", () => {
    expect(readCards(columnId)).toEqual([]);
  });

  it("writeCards and readCards round-trip", () => {
    const card = makeCard({ columnId });
    writeCards(columnId, [card]);
    expect(readCards(columnId)).toEqual([card]);
  });

  it("uses columnId-scoped key", () => {
    const card = makeCard({ columnId });
    writeCards(columnId, [card]);
    expect(readCards(FIXED_UUID_2)).toEqual([]);
  });
});

describe("Labels", () => {
  const boardId = FIXED_UUID;
  beforeEach(() => localStorage.clear());

  it("readLabels returns empty array when nothing stored", () => {
    expect(readLabels(boardId)).toEqual([]);
  });

  it("writeLabels and readLabels round-trip", () => {
    const label = makeLabel({ boardId });
    writeLabels(boardId, [label]);
    expect(readLabels(boardId)).toEqual([label]);
  });
});

describe("CardLabels", () => {
  const cardId = FIXED_UUID;
  beforeEach(() => localStorage.clear());

  it("readCardLabels returns empty array when nothing stored", () => {
    expect(readCardLabels(cardId)).toEqual([]);
  });

  it("writeCardLabels and readCardLabels round-trip", () => {
    const cl = makeCardLabel({ cardId });
    writeCardLabels(cardId, [cl]);
    expect(readCardLabels(cardId)).toEqual([cl]);
  });
});

describe("clearAll", () => {
  beforeEach(() => localStorage.clear());

  it("removes all kanban: keys", () => {
    localStorage.setItem("kanban:boards", "[]");
    localStorage.setItem("kanban:columns:abc", "[]");
    localStorage.setItem("other:key", "keep-me");
    clearAll();
    expect(localStorage.getItem("kanban:boards")).toBeNull();
    expect(localStorage.getItem("kanban:columns:abc")).toBeNull();
    expect(localStorage.getItem("other:key")).toBe("keep-me");
  });

  it("does nothing when no kanban keys exist", () => {
    localStorage.setItem("other", "value");
    expect(() => clearAll()).not.toThrow();
    expect(localStorage.getItem("other")).toBe("value");
  });
});
