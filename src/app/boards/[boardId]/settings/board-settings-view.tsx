"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBoard } from "@/features/board/hooks/use-board";
import { BoardHeader } from "@/features/board/components/board-header";
import { updateBoardSchema } from "@/features/board/types";

interface BoardSettingsViewProps {
  boardId: string;
}

export function BoardSettingsView({ boardId }: BoardSettingsViewProps) {
  const router = useRouter();
  const { board, updateBoard, deleteBoard, isLoading } = useBoard(boardId);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameSaved, setRenameSaved] = useState(false);

  useEffect(() => {
    if (board) {
      setRenameTitle(board.title);
    }
  }, [board]);

  // Redirect when board not found after load is complete
  useEffect(() => {
    if (!isLoading && !board) {
      router.replace("/boards");
    }
  }, [isLoading, board, router]);

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const result = updateBoardSchema.safeParse({ title: renameTitle });
    if (!result.success) {
      setRenameError("Board name is required.");
      return;
    }
    updateBoard({ title: result.data.title });
    setRenameError(null);
    setRenameSaved(true);
    setTimeout(() => setRenameSaved(false), 2000);
  }

  function handleDelete() {
    if (
      window.confirm(
        `Delete "${board?.title}"? This will remove all columns and cards. This cannot be undone.`,
      )
    ) {
      deleteBoard();
      router.replace("/boards");
    }
  }

  if (!board) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0c0e12",
        padding: "48px 32px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <BoardHeader boardId={boardId} />

        {/* Rename section */}
        <section
          style={{
            backgroundColor: "#171a1f",
            borderRadius: "4px",
            boxShadow: "0 20px 40px rgba(129,236,255,0.08)",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#f6f6fc",
              margin: "0 0 24px 0",
            }}
          >
            Rename Board
          </h2>
          <form onSubmit={handleRename} noValidate>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="rename-input"
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
                id="rename-input"
                type="text"
                value={renameTitle}
                onChange={(e) => {
                  setRenameTitle(e.target.value);
                  if (renameError) setRenameError(null);
                  if (renameSaved) setRenameSaved(false);
                }}
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
              {renameError && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    color: "#ff716c",
                    margin: "6px 0 0 0",
                  }}
                >
                  {renameError}
                </p>
              )}
              {renameSaved && (
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    color: "#81ecff",
                    margin: "6px 0 0 0",
                  }}
                >
                  Saved
                </p>
              )}
            </div>
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
                padding: "10px 20px",
                borderRadius: "4px",
                boxShadow: "0 0 12px rgba(129,236,255,0.2)",
              }}
            >
              Save
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section
          style={{
            backgroundColor: "rgba(255,113,108,0.1)",
            borderRadius: "4px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#ff716c",
              margin: "0 0 8px 0",
            }}
          >
            Danger Zone
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#aaabb0",
              margin: "0 0 20px 0",
            }}
          >
            Deleting a board is permanent and cannot be undone. All columns,
            cards, and labels will be removed.
          </p>
          <button
            onClick={handleDelete}
            style={{
              background: "none",
              border: "1px solid rgba(255,113,108,0.15)",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ff716c",
              padding: "10px 20px",
              borderRadius: "4px",
            }}
          >
            Delete Board
          </button>
        </section>
      </div>
    </div>
  );
}
