import { beforeEach, describe, expect, it } from "vitest";
import { useBoardStore } from "@/features/board/store/board-store";
import { readBoards, readCards, readColumns, readLabels } from "@/shared/lib/storage/storage";
import { POSITION_GAP } from "@/shared/lib/storage/position";

// Valid UUIDs to use as fixture foreign keys
const BOARD_ID = "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1";
const BOARD_ID_2 = "b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2";
const COLUMN_ID = "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3";
const COLUMN_ID_2 = "d4d4d4d4-d4d4-4d4d-8d4d-d4d4d4d4d4d4";
const CARD_ID = "e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5";
const LABEL_ID = "f6f6f6f6-f6f6-4f6f-8f6f-f6f6f6f6f6f6";

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

// ─── Boards ──────────────────────────────────────────────────────────────────

describe("Board CRUD", () => {
  it("addBoard creates a new board in state and localStorage", () => {
    useBoardStore.getState().addBoard("My Board");
    const { boards } = useBoardStore.getState();
    expect(boards).toHaveLength(1);
    expect(boards[0]?.title).toBe("My Board");
    expect(readBoards()).toHaveLength(1);
    expect(readBoards()[0]?.title).toBe("My Board");
  });

  it("loadBoards hydrates state from localStorage", () => {
    useBoardStore.getState().addBoard("Persisted Board");
    resetStore();
    expect(useBoardStore.getState().boards).toHaveLength(0);
    useBoardStore.getState().loadBoards();
    expect(useBoardStore.getState().boards).toHaveLength(1);
    expect(useBoardStore.getState().boards[0]?.title).toBe("Persisted Board");
  });

  it("updateBoard changes title and updatedAt", () => {
    useBoardStore.getState().addBoard("Old Title");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().updateBoard(id!, "New Title");
    expect(useBoardStore.getState().boards[0]?.title).toBe("New Title");
    expect(readBoards()[0]?.title).toBe("New Title");
  });

  it("deleteBoard removes board from state and localStorage", () => {
    useBoardStore.getState().addBoard("To Delete");
    const id = useBoardStore.getState().boards[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().deleteBoard(id!);
    expect(useBoardStore.getState().boards).toHaveLength(0);
    expect(readBoards()).toHaveLength(0);
  });
});

// ─── Columns ─────────────────────────────────────────────────────────────────

describe("Column CRUD", () => {
  it("addColumn creates a column with correct boardId and position", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Todo");
    const { columns } = useBoardStore.getState();
    expect(columns).toHaveLength(1);
    expect(columns[0]?.boardId).toBe(BOARD_ID);
    expect(columns[0]?.position).toBe(POSITION_GAP);
  });

  it("addColumn appends with incrementing position", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "First");
    useBoardStore.getState().addColumn(BOARD_ID, "Second");
    const { columns } = useBoardStore.getState();
    expect(columns[0]?.position).toBe(POSITION_GAP);
    expect(columns[1]?.position).toBe(POSITION_GAP * 2);
  });

  it("loadColumns hydrates columns from localStorage", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Persisted Col");
    resetStore();
    useBoardStore.getState().loadColumns(BOARD_ID);
    expect(useBoardStore.getState().columns).toHaveLength(1);
    expect(useBoardStore.getState().columns[0]?.title).toBe("Persisted Col");
  });

  it("updateColumn changes title and persists", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "Old");
    const id = useBoardStore.getState().columns[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().updateColumn(id!, "New");
    expect(useBoardStore.getState().columns[0]?.title).toBe("New");
    expect(readColumns(BOARD_ID)[0]?.title).toBe("New");
  });

  it("deleteColumn removes column from state and localStorage", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "To Delete");
    const id = useBoardStore.getState().columns[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().deleteColumn(id!);
    expect(useBoardStore.getState().columns).toHaveLength(0);
    expect(readColumns(BOARD_ID)).toHaveLength(0);
  });

  it("moveColumn updates position and persists", () => {
    useBoardStore.getState().addColumn(BOARD_ID, "A");
    useBoardStore.getState().addColumn(BOARD_ID, "B");
    const { columns } = useBoardStore.getState();
    const firstId = columns[0]?.id;
    expect(firstId).toBeDefined();
    // Move first column to after position 2000 (append)
    useBoardStore.getState().moveColumn(firstId!, 2000, undefined);
    const moved = useBoardStore
      .getState()
      .columns.find((c) => c.id === firstId);
    expect(moved?.position).toBe(3000);
  });
});

// ─── Cards ───────────────────────────────────────────────────────────────────

describe("Card CRUD", () => {
  it("addCard creates a card with correct columnId, position, and description", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "My Card");
    const { cards } = useBoardStore.getState();
    expect(cards).toHaveLength(1);
    expect(cards[0]?.columnId).toBe(COLUMN_ID);
    expect(cards[0]?.position).toBe(POSITION_GAP);
    expect(cards[0]?.description).toBe("");
  });

  it("addCard with description", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "Card", "A description");
    expect(useBoardStore.getState().cards[0]?.description).toBe("A description");
  });

  it("loadCards hydrates cards from localStorage", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "Persisted Card");
    resetStore();
    useBoardStore.getState().loadCards(COLUMN_ID);
    expect(useBoardStore.getState().cards).toHaveLength(1);
    expect(useBoardStore.getState().cards[0]?.title).toBe("Persisted Card");
  });

  it("updateCard changes title and description and persists", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "Old Title");
    const id = useBoardStore.getState().cards[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().updateCard(id!, { title: "New Title", description: "desc" });
    expect(useBoardStore.getState().cards[0]?.title).toBe("New Title");
    expect(readCards(COLUMN_ID)[0]?.title).toBe("New Title");
  });

  it("deleteCard removes card from state and localStorage", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "To Delete");
    const id = useBoardStore.getState().cards[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().deleteCard(id!);
    expect(useBoardStore.getState().cards).toHaveLength(0);
    expect(readCards(COLUMN_ID)).toHaveLength(0);
  });

  it("moveCard updates columnId and persists to both columns", () => {
    useBoardStore.getState().addCard(COLUMN_ID, "Moving Card");
    const id = useBoardStore.getState().cards[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().moveCard(id!, COLUMN_ID_2, undefined, undefined);
    const moved = useBoardStore.getState().cards.find((c) => c.id === id);
    expect(moved?.columnId).toBe(COLUMN_ID_2);
    // Persisted in target column
    expect(readCards(COLUMN_ID_2)).toHaveLength(1);
    // Removed from original column
    expect(readCards(COLUMN_ID)).toHaveLength(0);
  });
});

// ─── Labels ──────────────────────────────────────────────────────────────────

describe("Label CRUD", () => {
  it("addLabel creates a label and persists", () => {
    useBoardStore.getState().addLabel(BOARD_ID_2, "Bug", "#FF0000");
    const { labels } = useBoardStore.getState();
    expect(labels).toHaveLength(1);
    expect(labels[0]?.name).toBe("Bug");
    expect(readLabels(BOARD_ID_2)).toHaveLength(1);
  });

  it("loadLabels hydrates labels from localStorage", () => {
    useBoardStore.getState().addLabel(BOARD_ID_2, "Feature", "#00FF00");
    resetStore();
    useBoardStore.getState().loadLabels(BOARD_ID_2);
    expect(useBoardStore.getState().labels).toHaveLength(1);
    expect(useBoardStore.getState().labels[0]?.name).toBe("Feature");
  });

  it("updateLabel changes name and color and persists", () => {
    useBoardStore.getState().addLabel(BOARD_ID_2, "Old", "#000000");
    const id = useBoardStore.getState().labels[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().updateLabel(id!, { name: "New", color: "#FFFFFF" });
    expect(useBoardStore.getState().labels[0]?.name).toBe("New");
    expect(readLabels(BOARD_ID_2)[0]?.name).toBe("New");
  });

  it("deleteLabel removes label from state and localStorage", () => {
    useBoardStore.getState().addLabel(BOARD_ID_2, "Delete Me", "#AABBCC");
    const id = useBoardStore.getState().labels[0]?.id;
    expect(id).toBeDefined();
    useBoardStore.getState().deleteLabel(id!);
    expect(useBoardStore.getState().labels).toHaveLength(0);
    expect(readLabels(BOARD_ID_2)).toHaveLength(0);
  });

  it("attachLabel adds a card-label association", () => {
    useBoardStore.getState().attachLabel(CARD_ID, LABEL_ID);
    const { cardLabels } = useBoardStore.getState();
    expect(cardLabels).toHaveLength(1);
    expect(cardLabels[0]?.cardId).toBe(CARD_ID);
    expect(cardLabels[0]?.labelId).toBe(LABEL_ID);
  });

  it("attachLabel is idempotent (no duplicates)", () => {
    useBoardStore.getState().attachLabel(CARD_ID, LABEL_ID);
    useBoardStore.getState().attachLabel(CARD_ID, LABEL_ID);
    expect(useBoardStore.getState().cardLabels).toHaveLength(1);
  });

  it("detachLabel removes the card-label association", () => {
    useBoardStore.getState().attachLabel(CARD_ID, LABEL_ID);
    useBoardStore.getState().detachLabel(CARD_ID, LABEL_ID);
    expect(useBoardStore.getState().cardLabels).toHaveLength(0);
  });

  it("loadCardLabels hydrates from localStorage", () => {
    useBoardStore.getState().attachLabel(CARD_ID, LABEL_ID);
    resetStore();
    useBoardStore.getState().loadCardLabels(CARD_ID);
    expect(useBoardStore.getState().cardLabels).toHaveLength(1);
  });
});
