"use client";

import { useRef, useState } from "react";

interface AddColumnProps {
  onAdd: (title: string) => void;
}

export function AddColumn({ onAdd }: AddColumnProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function expand() {
    setIsExpanded(true);
    setTitle("");
    setError(null);
    // Auto-focus happens via autoFocus prop
  }

  function collapse() {
    setIsExpanded(false);
    setTitle("");
    setError(null);
  }

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Column title is required.");
      return;
    }
    onAdd(trimmed);
    collapse();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      collapse();
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={expand}
        aria-label="Add column"
        style={{
          width: "280px",
          height: "48px",
          flexShrink: 0,
          background: "none",
          border: "1px dashed rgba(170,171,176,0.3)",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#aaabb0",
          transition: "border-color 0.15s ease, color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(129,236,255,0.5)";
          btn.style.color = "#81ecff";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "rgba(170,171,176,0.3)";
          btn.style.color = "#aaabb0";
        }}
      >
        <span aria-hidden="true" style={{ fontSize: "18px", lineHeight: 1 }}>
          +
        </span>
        Add column
      </button>
    );
  }

  return (
    <div
      style={{
        width: "280px",
        flexShrink: 0,
        backgroundColor: "#171a1f",
        borderRadius: "4px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        autoFocus
        placeholder="Column title..."
        aria-label="Column title"
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "2px solid #81ecff",
          borderRadius: 0,
          padding: "6px 0",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#f6f6fc",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <p
          role="alert"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#ff716c",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={handleSubmit}
          aria-label="Submit new column"
          style={{
            background: "#81ecff",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: "#005762",
            padding: "6px 14px",
            borderRadius: "4px",
            boxShadow: "0 0 12px rgba(129,236,255,0.2)",
          }}
        >
          Add
        </button>
        <button
          onClick={collapse}
          aria-label="Cancel adding column"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            color: "#81ecff",
            padding: "6px 10px",
            borderRadius: "4px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
