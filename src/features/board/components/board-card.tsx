"use client";

import { useState } from "react";
import Link from "next/link";
import type { Board } from "@/features/board/types/index";

interface BoardCardProps {
  board: Board;
  onDelete: (id: string) => void;
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const [hovered, setHovered] = useState(false);

  function handleDelete() {
    if (window.confirm(`Delete "${board.title}"? This cannot be undone.`)) {
      onDelete(board.id);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "#292c33" : "#171a1f",
        borderRadius: "4px",
        boxShadow: "0 20px 40px rgba(129,236,255,0.08)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "background-color 0.15s ease",
        cursor: "default",
      }}
    >
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "18px",
          fontWeight: 600,
          color: "#f6f6fc",
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {board.title}
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href={`/boards/${board.id}/settings`}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#81ecff",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Open
        </Link>
        <button
          onClick={handleDelete}
          aria-label={`Delete board "${board.title}"`}
          title="Delete board"
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
            (e.currentTarget as HTMLButtonElement).style.color = "#ff716c";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#aaabb0";
          }}
        >
          {/* Trash icon (SVG) */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 4h12M5.333 4V2.667A.667.667 0 016 2h4a.667.667 0 01.667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A.667.667 0 004.667 14h6.666a.667.667 0 00.667-.667L12.667 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
