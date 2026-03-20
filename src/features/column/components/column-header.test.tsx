import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColumnHeader } from "@/features/column/components/column-header";

const COLUMN_ID = "c0000000-0000-4000-8000-000000000001";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ColumnHeader", () => {
  it("renders the column title", () => {
    render(
      <ColumnHeader
        title="My Column"
        columnId={COLUMN_ID}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("My Column")).toBeTruthy();
  });

  it("clicking title enters edit mode showing an input", () => {
    render(
      <ColumnHeader
        title="Click Me"
        columnId={COLUMN_ID}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const titleSpan = screen.getByRole("button", { name: /rename column/i });
    fireEvent.click(titleSpan);

    const input = screen.getByRole("textbox", { name: /edit column title/i });
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("Click Me");
  });

  it("pressing Enter with a new title calls onRename and exits edit mode", () => {
    const onRename = vi.fn();
    render(
      <ColumnHeader
        title="Old Title"
        columnId={COLUMN_ID}
        onRename={onRename}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /rename column/i }));

    const input = screen.getByRole("textbox", { name: /edit column title/i });
    fireEvent.change(input, { target: { value: "New Title" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onRename).toHaveBeenCalledWith(COLUMN_ID, "New Title");
    // After commit the input should be gone
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("pressing Escape cancels edit without calling onRename", () => {
    const onRename = vi.fn();
    render(
      <ColumnHeader
        title="Original"
        columnId={COLUMN_ID}
        onRename={onRename}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /rename column/i }));
    const input = screen.getByRole("textbox", { name: /edit column title/i });
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("Original")).toBeTruthy();
  });

  it("trash button triggers window.confirm then calls onDelete on confirmation", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn();
    render(
      <ColumnHeader
        title="Delete Me"
        columnId={COLUMN_ID}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /delete column/i }));
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(COLUMN_ID);
  });

  it("trash button does not call onDelete when confirm is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn();
    render(
      <ColumnHeader
        title="Cancel Delete"
        columnId={COLUMN_ID}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /delete column/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
