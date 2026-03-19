import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateBoardDialog } from "@/features/board/components/create-board-dialog";
import type { Board } from "@/features/board/types/index";

const makeBoard = (title: string): Board => ({
  id: "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
  title,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// jsdom does not implement showModal/close on <dialog>; patch them.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

function renderDialog(
  props: Partial<Parameters<typeof CreateBoardDialog>[0]> = {},
) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    onCreate: vi.fn().mockImplementation((title: string) => makeBoard(title)),
  };
  return render(<CreateBoardDialog {...defaults} {...props} />);
}

describe("CreateBoardDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders dialog with heading when open", () => {
    renderDialog({ open: true });
    expect(screen.getByText(/new board/i)).toBeTruthy();
  });

  it("renders the board name input", () => {
    renderDialog({ open: true });
    expect(screen.getByLabelText(/board name/i)).toBeTruthy();
  });

  it("shows an error when submitting with empty title", () => {
    renderDialog({ open: true });
    fireEvent.click(screen.getByRole("button", { name: /create board/i }));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/required/i)).toBeTruthy();
  });

  it("calls onCreate and onClose when a valid title is submitted", () => {
    const onClose = vi.fn();
    const onCreate = vi.fn().mockReturnValue(makeBoard("My Board"));
    renderDialog({ open: true, onClose, onCreate });

    const input = screen.getByLabelText(/board name/i);
    fireEvent.change(input, { target: { value: "My Board" } });
    fireEvent.click(screen.getByRole("button", { name: /create board/i }));

    expect(onCreate).toHaveBeenCalledWith("My Board");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onCreated with the new board on successful submit", () => {
    const onCreated = vi.fn();
    const board = makeBoard("New");
    const onCreate = vi.fn().mockReturnValue(board);
    renderDialog({ open: true, onCreate, onCreated });

    fireEvent.change(screen.getByLabelText(/board name/i), {
      target: { value: "New" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create board/i }));

    expect(onCreated).toHaveBeenCalledWith(board);
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    renderDialog({ open: true, onClose });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("clears error when user starts typing after an error", () => {
    renderDialog({ open: true });
    fireEvent.click(screen.getByRole("button", { name: /create board/i }));
    expect(screen.getByRole("alert")).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/board name/i), {
      target: { value: "a" },
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
