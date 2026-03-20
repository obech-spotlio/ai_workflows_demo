"use client";

import type { Board } from "@/features/board/types/index";
import { BoardCard } from "@/features/board/components/board-card";

interface BoardListProps {
  boards: Board[];
  onDelete: (id: string) => void;
  onCreateNew?: () => void;
}

export function BoardList({ boards, onDelete, onCreateNew }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "16px",
            color: "#aaabb0",
            margin: 0,
          }}
        >
          No boards yet
        </p>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#81ecff",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Create your first board
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px",
      }}
    >
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} onDelete={onDelete} />
      ))}
    </div>
  );
}
