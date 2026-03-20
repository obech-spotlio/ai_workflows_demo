"use client";

import { useState, type ReactNode } from "react";
import type { Column as ColumnType } from "@/features/board/types/index";
import { ColumnHeader } from "@/features/column/components/column-header";

interface ColumnProps {
  column: ColumnType;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => void;
  children?: ReactNode;
}

export function Column({
  column,
  onRename,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", column.id);
    onDragStart?.(e, column.id);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
    onDragOver?.(e);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // Only clear drag-over if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    onDrop?.(e, column.id);
  }

  function handleDragEnd() {
    setIsDragOver(false);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      data-column-id={column.id}
      style={{
        width: "280px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#171a1f",
        borderRadius: "4px",
        boxShadow: isDragOver
          ? "0 20px 40px rgba(129,236,255,0.08), inset 0 0 0 1px rgba(129,236,255,0.3)"
          : "0 20px 40px rgba(129,236,255,0.08)",
        border: isDragOver
          ? "1px solid rgba(129,236,255,0.3)"
          : "1px solid transparent",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      <ColumnHeader
        title={column.title}
        columnId={column.id}
        onRename={onRename}
        onDelete={onDelete}
        {...(onDragStart ? { onDragStart } : {})}
      />

      {/* Scrollable card area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
