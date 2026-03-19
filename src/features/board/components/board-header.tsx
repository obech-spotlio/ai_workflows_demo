"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useBoard } from "@/features/board/hooks/use-board";

interface BoardHeaderProps {
  boardId: string;
}

export function BoardHeader({ boardId }: BoardHeaderProps) {
  const { board, updateBoard } = useBoard(boardId);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (board) {
      setDraftTitle(board.title);
    }
  }, [board]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleEditStart() {
    if (board) {
      setDraftTitle(board.title);
      setIsEditing(true);
    }
  }

  function handleSave() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== board?.title) {
      updateBoard({ title: trimmed });
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setDraftTitle(board?.title ?? "");
    }
  }

  return (
    <header style={{ marginBottom: "32px" }}>
      <Link
        href="/boards"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#81ecff",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        ← Back to Boards
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            aria-label="Edit board title"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: "2px solid #81ecff",
              borderRadius: 0,
              padding: "4px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#f6f6fc",
              outline: "none",
              minWidth: "200px",
              width: "100%",
              maxWidth: "600px",
            }}
          />
        ) : (
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#f6f6fc",
              margin: 0,
            }}
          >
            {board?.title ?? "Loading…"}
          </h1>
        )}

        {!isEditing && (
          <button
            onClick={handleEditStart}
            aria-label="Edit board title"
            title="Rename board"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#aaabb0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#81ecff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#aaabb0";
            }}
          >
            {/* Pencil icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.75 2.25a1.591 1.591 0 012.25 2.25L5.25 14.25l-3 .75.75-3L12.75 2.25z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
