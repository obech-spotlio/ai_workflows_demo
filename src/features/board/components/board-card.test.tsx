import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardCard } from "@/features/board/components/board-card";
import type { Board } from "@/features/board/types/index";

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockBoard: Board = {
  id: "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
  title: "Test Board",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("BoardCard", () => {
  it("renders board title", () => {
    render(<BoardCard board={mockBoard} onDelete={vi.fn()} />);
    expect(screen.getByText("Test Board")).toBeTruthy();
  });

  it("renders Open link pointing to settings page", () => {
    render(<BoardCard board={mockBoard} onDelete={vi.fn()} />);
    const link = screen.getByRole("link", { name: /open/i });
    expect(link.getAttribute("href")).toBe(
      `/boards/${mockBoard.id}/settings`,
    );
  });

  it("renders delete button", () => {
    render(<BoardCard board={mockBoard} onDelete={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /delete board/i }),
    ).toBeTruthy();
  });

  it("calls onDelete with board id when confirmed", () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);
    const onDelete = vi.fn();

    render(<BoardCard board={mockBoard} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete board/i }));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(mockBoard.id);
  });

  it("does not call onDelete when confirm is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn();

    render(<BoardCard board={mockBoard} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete board/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
