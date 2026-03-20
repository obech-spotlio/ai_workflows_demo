"use client";

import { useState } from "react";
import { useBoards } from "@/features/board/hooks/use-boards";
import { BoardList } from "@/features/board/components/board-list";
import { CreateBoardDialog } from "@/features/board/components/create-board-dialog";

export function BoardsView() {
  const { boards, addBoard, deleteBoard } = useBoards();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0c0e12",
        padding: "48px 32px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#f6f6fc",
              margin: 0,
            }}
          >
            My Boards
          </h1>
          <button
            onClick={() => setDialogOpen(true)}
            style={{
              background: "#81ecff",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#005762",
              padding: "10px 20px",
              borderRadius: "4px",
              boxShadow: "0 0 12px rgba(129,236,255,0.2)",
            }}
          >
            New Board
          </button>
        </div>

        <BoardList
          boards={boards}
          onDelete={deleteBoard}
          onCreateNew={() => setDialogOpen(true)}
        />

        <CreateBoardDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={(title) => addBoard({ title })}
        />
      </div>
    </div>
  );
}
