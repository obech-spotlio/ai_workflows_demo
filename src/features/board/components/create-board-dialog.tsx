"use client";

import { useEffect, useRef, useState } from "react";
import type { Board } from "@/features/board/types/index";
import { createBoardSchema } from "@/features/board/types";

interface CreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (board: Board) => void;
  onCreate: (title: string) => Board;
}

export function CreateBoardDialog({
  open,
  onClose,
  onCreated,
  onCreate,
}: CreateBoardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      inputRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setTitle("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createBoardSchema.safeParse({ title });
    if (!result.success) {
      setError("Board name is required.");
      return;
    }
    const board = onCreate(result.data.title);
    onCreated?.(board);
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      style={{
        background: "#23262c",
        borderRadius: "8px",
        border: "none",
        padding: "32px",
        width: "100%",
        maxWidth: "440px",
        color: "#f6f6fc",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <style>{`
        dialog::backdrop {
          background: rgba(0,0,0,0.6);
        }
      `}</style>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "#f6f6fc",
          margin: "0 0 24px 0",
        }}
      >
        New Board
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="board-title-input"
            style={{
              display: "block",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#aaabb0",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Board Name
          </label>
          <input
            ref={inputRef}
            id="board-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Product Roadmap"
            autoComplete="off"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid #81ecff",
              borderRadius: 0,
              padding: "8px 0",
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
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
                fontSize: "13px",
                color: "#ff716c",
                margin: "6px 0 0 0",
              }}
            >
              {error}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#aaabb0",
              marginRight: "auto",
            }}
          >
            ESC to close
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#81ecff",
              padding: "8px 16px",
              borderRadius: "4px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#81ecff",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#005762",
              padding: "8px 20px",
              borderRadius: "4px",
              boxShadow: "0 0 12px rgba(129,236,255,0.2)",
            }}
          >
            Create Board
          </button>
        </div>
      </form>
    </dialog>
  );
}
