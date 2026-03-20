import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Column } from "@/features/column/components/column";
import type { Column as ColumnType } from "@/features/board/types/index";

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockColumn: ColumnType = {
  id: "c0000000-0000-4000-8000-000000000001",
  boardId: "b0000000-0000-4000-8000-000000000001",
  title: "Test Column",
  position: 1000,
  createdAt: new Date().toISOString(),
};

describe("Column", () => {
  it("renders ColumnHeader with the column title", () => {
    render(
      <Column
        column={mockColumn}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Test Column")).toBeTruthy();
  });

  it("renders children inside the column body", () => {
    render(
      <Column
        column={mockColumn}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      >
        <div data-testid="child-card">Card 1</div>
      </Column>,
    );
    expect(screen.getByTestId("child-card")).toBeTruthy();
    expect(screen.getByText("Card 1")).toBeTruthy();
  });

  it("is draggable (has draggable attribute)", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const columnEl = container.querySelector("[data-column-id]");
    expect(columnEl).toBeTruthy();
    expect(columnEl?.getAttribute("draggable")).toBe("true");
  });

  it("shows drag-over visual state when dragover event fires", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const columnEl = container.querySelector("[data-column-id]") as HTMLElement;
    expect(columnEl).toBeTruthy();

    // Before dragover — no drag-over border
    expect(columnEl.style.borderColor).not.toContain("rgba(129,236,255,0.3)");

    fireEvent.dragOver(columnEl, {
      dataTransfer: { dropEffect: "" },
    });

    // After dragover — border should reflect drag-over state
    // jsdom normalises colour spaces to include spaces, so match loosely
    expect(columnEl.style.border).toMatch(/rgba\(129,\s*236,\s*255,\s*0\.3\)/);
  });

  it("calls onDrop callback when drop event fires", () => {
    const onDrop = vi.fn();
    const { container } = render(
      <Column
        column={mockColumn}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        onDrop={onDrop}
      />,
    );
    const columnEl = container.querySelector("[data-column-id]") as HTMLElement;
    fireEvent.drop(columnEl);
    expect(onDrop).toHaveBeenCalledWith(expect.anything(), mockColumn.id);
  });
});
