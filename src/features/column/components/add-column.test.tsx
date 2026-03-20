import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddColumn } from "@/features/column/components/add-column";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AddColumn", () => {
  it("renders collapsed button with '+ Add column' text", () => {
    render(<AddColumn onAdd={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /add column/i });
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Add column");
  });

  it("clicking the button expands into an input", () => {
    render(<AddColumn onAdd={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));
    expect(screen.getByRole("textbox", { name: /column title/i })).toBeTruthy();
  });

  it("submitting a valid title calls onAdd and collapses", () => {
    const onAdd = vi.fn();
    render(<AddColumn onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));

    const input = screen.getByRole("textbox", { name: /column title/i });
    fireEvent.change(input, { target: { value: "Sprint 1" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("Sprint 1");
    // Should collapse back to the button
    expect(screen.getByRole("button", { name: /add column/i })).toBeTruthy();
  });

  it("clicking Add button submits valid title", () => {
    const onAdd = vi.fn();
    render(<AddColumn onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));

    const input = screen.getByRole("textbox", { name: /column title/i });
    fireEvent.change(input, { target: { value: "Backlog" } });
    fireEvent.click(screen.getByRole("button", { name: /submit new column/i }));

    expect(onAdd).toHaveBeenCalledWith("Backlog");
  });

  it("submitting empty title shows error and does not call onAdd", () => {
    const onAdd = vi.fn();
    render(<AddColumn onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit new column/i }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("pressing Escape collapses without calling onAdd", () => {
    const onAdd = vi.fn();
    render(<AddColumn onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));

    const input = screen.getByRole("textbox", { name: /column title/i });
    fireEvent.change(input, { target: { value: "Draft" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /add column/i })).toBeTruthy();
  });

  it("clicking Cancel button collapses", () => {
    render(<AddColumn onAdd={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /cancel adding column/i }),
    );
    expect(screen.getByRole("button", { name: /add column/i })).toBeTruthy();
  });
});
