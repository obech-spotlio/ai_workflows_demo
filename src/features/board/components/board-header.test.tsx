import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardHeader } from "@/features/board/components/board-header";

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

// Mock the hook — factory must not reference top-level variables (hoisting rule)
vi.mock("@/features/board/hooks/use-board", () => ({
  useBoard: vi.fn(),
}));

// Import the mocked module after vi.mock
import { useBoard } from "@/features/board/hooks/use-board";

const mockUseBoard = vi.mocked(useBoard);

const defaultBoard = {
  id: "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
  title: "My Test Board",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("BoardHeader", () => {
  beforeEach(() => {
    mockUseBoard.mockReturnValue({
      board: defaultBoard,
      updateBoard: vi.fn(),
      deleteBoard: vi.fn(),
      isLoading: false,
    });
  });

  it("renders Back to Boards link pointing to /boards", () => {
    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    const link = screen.getByRole("link", { name: /back to boards/i });
    expect(link.getAttribute("href")).toBe("/boards");
  });

  it("renders board title", () => {
    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    expect(screen.getByText("My Test Board")).toBeTruthy();
  });

  it("renders edit button", () => {
    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    expect(
      screen.getByRole("button", { name: /edit board title/i }),
    ).toBeTruthy();
  });

  it("switches to edit input when edit button is clicked", () => {
    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    fireEvent.click(screen.getByRole("button", { name: /edit board title/i }));
    const input = screen.getByRole("textbox", { name: /edit board title/i });
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("My Test Board");
  });

  it("calls updateBoard on Enter with a changed title", () => {
    const mockUpdate = vi.fn();
    mockUseBoard.mockReturnValue({
      board: defaultBoard,
      updateBoard: mockUpdate,
      deleteBoard: vi.fn(),
      isLoading: false,
    });

    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    fireEvent.click(screen.getByRole("button", { name: /edit board title/i }));
    const input = screen.getByRole("textbox", { name: /edit board title/i });
    fireEvent.change(input, { target: { value: "Renamed Board" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockUpdate).toHaveBeenCalledWith({ title: "Renamed Board" });
  });

  it("calls updateBoard on blur with a changed title", () => {
    const mockUpdate = vi.fn();
    mockUseBoard.mockReturnValue({
      board: defaultBoard,
      updateBoard: mockUpdate,
      deleteBoard: vi.fn(),
      isLoading: false,
    });

    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    fireEvent.click(screen.getByRole("button", { name: /edit board title/i }));
    const input = screen.getByRole("textbox", { name: /edit board title/i });
    fireEvent.change(input, { target: { value: "Another Title" } });
    fireEvent.blur(input);

    expect(mockUpdate).toHaveBeenCalledWith({ title: "Another Title" });
  });

  it("does not call updateBoard on Escape and reverts title", () => {
    const mockUpdate = vi.fn();
    mockUseBoard.mockReturnValue({
      board: defaultBoard,
      updateBoard: mockUpdate,
      deleteBoard: vi.fn(),
      isLoading: false,
    });

    render(<BoardHeader boardId="a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1" />);
    fireEvent.click(screen.getByRole("button", { name: /edit board title/i }));
    const input = screen.getByRole("textbox", { name: /edit board title/i });
    fireEvent.change(input, { target: { value: "Discarded" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(mockUpdate).not.toHaveBeenCalled();
    // After Escape, edit mode should close and original title is shown
    expect(screen.getByText("My Test Board")).toBeTruthy();
  });
});
