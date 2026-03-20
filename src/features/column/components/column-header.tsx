"use client";

import { useRef, useState } from "react";

interface ColumnHeaderProps {
  title: string;
  columnId: string;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
}

export function ColumnHeader({
  title,
  columnId,
  onRename,
  onDelete,
  onDragStart,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  function enterEditMode() {
    setEditValue(title);
    setIsEditing(true);
    // Selection happens in onFocus
  }

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed.length > 0) {
      onRename(columnId, trimmed);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(title);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }

  function handleDelete() {
    if (
      window.confirm(
        `Delete column "${title}"? All cards in this column will also be deleted.`,
      )
    ) {
      onDelete(columnId);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 12px 8px 12px",
        minHeight: "48px",
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={
          onDragStart
            ? (e: React.DragEvent<HTMLDivElement>) => onDragStart(e, columnId)
            : undefined
        }
        draggable={!!onDragStart}
        aria-label="Drag to reorder column"
        title="Drag to reorder"
        style={{
          cursor: "grab",
          color: "#aaabb0",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "2px",
        }}
      >
        {/* 6-dot grip SVG */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="4" cy="3" r="1.2" />
          <circle cx="10" cy="3" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="11" r="1.2" />
          <circle cx="10" cy="11" r="1.2" />
        </svg>
      </div>

      {/* Title or edit input */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            autoFocus
            aria-label="Edit column title"
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid #81ecff",
              borderRadius: 0,
              padding: "2px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#f6f6fc",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Rename column: ${title}`}
            onClick={enterEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") enterEditMode();
            }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#f6f6fc",
              cursor: "text",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        aria-label={`Delete column "${title}"`}
        title="Delete column"
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
          flexShrink: 0,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#ff716c";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#aaabb0";
        }}
      >
        {/* Trash icon SVG — same as board-card.tsx */}
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
  );
}
