import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardList } from "@/features/board/components/board-list";
import type { Board } from "@/features/board/types/index";

// Mock next/link
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

const makeBoard = (id: string, title: string): Board => ({
  id,
  title,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("BoardList", () => {
  it("renders empty state when boards array is empty", () => {
    render(<BoardList boards={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no boards yet/i)).toBeTruthy();
  });

  it("renders CTA button in empty state when onCreateNew is provided", () => {
    const onCreateNew = vi.fn();
    render(<BoardList boards={[]} onDelete={vi.fn()} onCreateNew={onCreateNew} />);
    const cta = screen.getByRole("button", { name: /create your first board/i });
    expect(cta).toBeTruthy();
    fireEvent.click(cta);
    expect(onCreateNew).toHaveBeenCalledOnce();
  });

  it("renders a card for each board", () => {
    const boards = [
      makeBoard("id-1", "Alpha"),
      makeBoard("id-2", "Beta"),
      makeBoard("id-3", "Gamma"),
    ];
    render(<BoardList boards={boards} onDelete={vi.fn()} />);
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.getByText("Gamma")).toBeTruthy();
  });

  it("does not show empty state when boards exist", () => {
    const boards = [makeBoard("id-1", "My Board")];
    render(<BoardList boards={boards} onDelete={vi.fn()} />);
    expect(screen.queryByText(/no boards yet/i)).toBeNull();
  });

  it("passes onDelete down to each BoardCard", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn();
    const boards = [makeBoard("id-1", "Board One")];
    render(<BoardList boards={boards} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete board/i }));
    expect(onDelete).toHaveBeenCalledWith("id-1");
  });
});
