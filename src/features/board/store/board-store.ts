import { create } from "zustand";
import {
  Board,
  Card,
  CardLabel,
  Column,
  Label,
} from "@/features/board/types";
import {
  readBoards,
  readCardLabels,
  readCards,
  readColumns,
  readLabels,
  removeKey,
  STORAGE_KEYS,
  writeBoards,
  writeCardLabels,
  writeCards,
  writeColumns,
  writeLabels,
} from "@/shared/lib/storage/storage";
import {
  calculatePosition,
  needsReindex,
  reindexPositions,
} from "@/shared/lib/storage/position";

interface BoardState {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  labels: Label[];
  cardLabels: CardLabel[];

  // Board actions
  loadBoards: () => void;
  addBoard: (title: string) => void;
  updateBoard: (id: string, title: string) => void;
  deleteBoard: (id: string) => void;

  // Column actions
  loadColumns: (boardId: string) => void;
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  moveColumn: (id: string, before?: number, after?: number) => void;

  // Card actions
  loadCards: (columnId: string) => void;
  addCard: (columnId: string, title: string, description?: string) => void;
  updateCard: (
    id: string,
    updates: { title?: string; description?: string },
  ) => void;
  deleteCard: (id: string) => void;
  moveCard: (
    id: string,
    targetColumnId: string,
    before?: number,
    after?: number,
  ) => void;

  // Label actions
  loadLabels: (boardId: string) => void;
  addLabel: (boardId: string, name: string, color: string) => void;
  updateLabel: (id: string, updates: { name?: string; color?: string }) => void;
  deleteLabel: (id: string) => void;
  attachLabel: (cardId: string, labelId: string) => void;
  detachLabel: (cardId: string, labelId: string) => void;
  loadCardLabels: (cardId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  columns: [],
  cards: [],
  labels: [],
  cardLabels: [],

  // ─── Board actions ───────────────────────────────────────────────────────────

  loadBoards: () => {
    const boards = readBoards();
    set({ boards });
  },

  addBoard: (title: string) => {
    const now = new Date().toISOString();
    const board: Board = {
      id: crypto.randomUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    };
    const boards = [...get().boards, board];
    set({ boards });
    writeBoards(boards);
  },

  updateBoard: (id: string, title: string) => {
    const boards = get().boards.map((b) =>
      b.id === id ? { ...b, title, updatedAt: new Date().toISOString() } : b,
    );
    set({ boards });
    writeBoards(boards);
  },

  deleteBoard: (id: string) => {
    // Cascade: remove columns, their cards + card-labels, and labels for this board
    const boardColumns = get().columns.filter((c) => c.boardId === id);
    for (const col of boardColumns) {
      const colCards = get().cards.filter((c) => c.columnId === col.id);
      for (const card of colCards) {
        removeKey(STORAGE_KEYS.cardLabels(card.id));
      }
      removeKey(STORAGE_KEYS.cards(col.id));
    }
    removeKey(STORAGE_KEYS.columns(id));
    removeKey(STORAGE_KEYS.labels(id));

    const columnIds = new Set(boardColumns.map((c) => c.id));
    const cardIds = new Set(
      get()
        .cards.filter((c) => columnIds.has(c.columnId))
        .map((c) => c.id),
    );

    const boards = get().boards.filter((b) => b.id !== id);
    const columns = get().columns.filter((c) => c.boardId !== id);
    const cards = get().cards.filter((c) => !columnIds.has(c.columnId));
    const labels = get().labels.filter((l) => l.boardId !== id);
    const cardLabels = get().cardLabels.filter(
      (cl) => !cardIds.has(cl.cardId),
    );

    set({ boards, columns, cards, labels, cardLabels });
    writeBoards(boards);
  },

  // ─── Column actions ──────────────────────────────────────────────────────────

  loadColumns: (boardId: string) => {
    const loaded = readColumns(boardId);
    const existing = get().columns.filter((c) => c.boardId !== boardId);
    set({ columns: [...existing, ...loaded] });
  },

  addColumn: (boardId: string, title: string) => {
    const existing = get().columns.filter((c) => c.boardId === boardId);
    const maxPos =
      existing.length > 0
        ? Math.max(...existing.map((c) => c.position))
        : undefined;
    const position = calculatePosition(maxPos, undefined);
    const column: Column = {
      id: crypto.randomUUID(),
      boardId,
      title,
      position,
      createdAt: new Date().toISOString(),
    };
    const allColumns = [...get().columns, column];
    set({ columns: allColumns });
    writeColumns(
      boardId,
      allColumns.filter((c) => c.boardId === boardId),
    );
  },

  updateColumn: (id: string, title: string) => {
    const columns = get().columns.map((c) =>
      c.id === id ? { ...c, title } : c,
    );
    set({ columns });
    const updated = columns.find((c) => c.id === id);
    if (updated) {
      writeColumns(
        updated.boardId,
        columns.filter((c) => c.boardId === updated.boardId),
      );
    }
  },

  deleteColumn: (id: string) => {
    const target = get().columns.find((c) => c.id === id);
    const columns = get().columns.filter((c) => c.id !== id);
    set({ columns });
    if (target) {
      writeColumns(
        target.boardId,
        columns.filter((c) => c.boardId === target.boardId),
      );
    }
  },

  moveColumn: (id: string, before?: number, after?: number) => {
    const column = get().columns.find((c) => c.id === id);
    if (!column) return;

    let newPosition = calculatePosition(before, after);
    let boardColumns = get()
      .columns.filter((c) => c.boardId === column.boardId)
      .map((c) => (c.id === id ? { ...c, position: newPosition } : c));

    if (needsReindex(boardColumns.map((c) => c.position))) {
      const sorted = [...boardColumns].sort((a, b) => a.position - b.position);
      boardColumns = reindexPositions(sorted);
      newPosition =
        boardColumns.find((c) => c.id === id)?.position ?? newPosition;
    }

    const columns = get().columns.map((c) => {
      const updated = boardColumns.find((bc) => bc.id === c.id);
      return updated ?? c;
    });

    set({ columns });
    writeColumns(column.boardId, boardColumns);
  },

  // ─── Card actions ────────────────────────────────────────────────────────────

  loadCards: (columnId: string) => {
    const loaded = readCards(columnId);
    const existing = get().cards.filter((c) => c.columnId !== columnId);
    set({ cards: [...existing, ...loaded] });
  },

  addCard: (columnId: string, title: string, description?: string) => {
    const existing = get().cards.filter((c) => c.columnId === columnId);
    const maxPos =
      existing.length > 0
        ? Math.max(...existing.map((c) => c.position))
        : undefined;
    const position = calculatePosition(maxPos, undefined);
    const now = new Date().toISOString();
    const card: Card = {
      id: crypto.randomUUID(),
      columnId,
      title,
      description: description ?? "",
      position,
      createdAt: now,
      updatedAt: now,
    };
    const allCards = [...get().cards, card];
    set({ cards: allCards });
    writeCards(
      columnId,
      allCards.filter((c) => c.columnId === columnId),
    );
  },

  updateCard: (
    id: string,
    updates: { title?: string; description?: string },
  ) => {
    const cards = get().cards.map((c) =>
      c.id === id
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c,
    );
    set({ cards });
    const updated = cards.find((c) => c.id === id);
    if (updated) {
      writeCards(
        updated.columnId,
        cards.filter((c) => c.columnId === updated.columnId),
      );
    }
  },

  deleteCard: (id: string) => {
    const target = get().cards.find((c) => c.id === id);
    const cards = get().cards.filter((c) => c.id !== id);
    set({ cards });
    if (target) {
      writeCards(
        target.columnId,
        cards.filter((c) => c.columnId === target.columnId),
      );
    }
  },

  moveCard: (
    id: string,
    targetColumnId: string,
    before?: number,
    after?: number,
  ) => {
    const card = get().cards.find((c) => c.id === id);
    if (!card) return;

    const originalColumnId = card.columnId;
    let newPosition = calculatePosition(before, after);

    let columnCards = get()
      .cards.filter((c) => c.columnId === targetColumnId || c.id === id)
      .filter((c) => c.columnId === targetColumnId || c.id === id)
      .map((c) =>
        c.id === id
          ? { ...c, columnId: targetColumnId, position: newPosition }
          : c,
      );

    // Filter to only target column after the move
    columnCards = [
      ...get()
        .cards.filter(
          (c) => c.columnId === targetColumnId && c.id !== id,
        )
        .map((c) => c),
      { ...card, columnId: targetColumnId, position: newPosition },
    ];

    if (needsReindex(columnCards.map((c) => c.position))) {
      const sorted = [...columnCards].sort((a, b) => a.position - b.position);
      columnCards = reindexPositions(sorted);
      newPosition =
        columnCards.find((c) => c.id === id)?.position ?? newPosition;
    }

    const cards = get().cards.map((c) => {
      if (c.id === id) {
        return { ...c, columnId: targetColumnId, position: newPosition, updatedAt: new Date().toISOString() };
      }
      const updated = columnCards.find((cc) => cc.id === c.id);
      return updated ?? c;
    });

    set({ cards });

    // Persist target column cards
    writeCards(
      targetColumnId,
      cards.filter((c) => c.columnId === targetColumnId),
    );

    // Persist original column if different
    if (originalColumnId !== targetColumnId) {
      writeCards(
        originalColumnId,
        cards.filter((c) => c.columnId === originalColumnId),
      );
    }
  },

  // ─── Label actions ───────────────────────────────────────────────────────────

  loadLabels: (boardId: string) => {
    const loaded = readLabels(boardId);
    const existing = get().labels.filter((l) => l.boardId !== boardId);
    set({ labels: [...existing, ...loaded] });
  },

  addLabel: (boardId: string, name: string, color: string) => {
    const label: Label = {
      id: crypto.randomUUID(),
      boardId,
      name,
      color,
    };
    const labels = [...get().labels, label];
    set({ labels });
    writeLabels(
      boardId,
      labels.filter((l) => l.boardId === boardId),
    );
  },

  updateLabel: (id: string, updates: { name?: string; color?: string }) => {
    const labels = get().labels.map((l) =>
      l.id === id ? { ...l, ...updates } : l,
    );
    set({ labels });
    const updated = labels.find((l) => l.id === id);
    if (updated) {
      writeLabels(
        updated.boardId,
        labels.filter((l) => l.boardId === updated.boardId),
      );
    }
  },

  deleteLabel: (id: string) => {
    const target = get().labels.find((l) => l.id === id);
    const labels = get().labels.filter((l) => l.id !== id);
    set({ labels });
    if (target) {
      writeLabels(
        target.boardId,
        labels.filter((l) => l.boardId === target.boardId),
      );
    }
  },

  attachLabel: (cardId: string, labelId: string) => {
    const existing = get().cardLabels.find(
      (cl) => cl.cardId === cardId && cl.labelId === labelId,
    );
    if (existing) return;
    const cardLabels = [...get().cardLabels, { cardId, labelId }];
    set({ cardLabels });
    writeCardLabels(
      cardId,
      cardLabels.filter((cl) => cl.cardId === cardId),
    );
  },

  detachLabel: (cardId: string, labelId: string) => {
    const cardLabels = get().cardLabels.filter(
      (cl) => !(cl.cardId === cardId && cl.labelId === labelId),
    );
    set({ cardLabels });
    writeCardLabels(
      cardId,
      cardLabels.filter((cl) => cl.cardId === cardId),
    );
  },

  loadCardLabels: (cardId: string) => {
    const loaded = readCardLabels(cardId);
    const existing = get().cardLabels.filter((cl) => cl.cardId !== cardId);
    set({ cardLabels: [...existing, ...loaded] });
  },
}));
