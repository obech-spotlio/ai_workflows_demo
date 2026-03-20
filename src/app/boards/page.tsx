import type { Metadata } from "next";
import { BoardsView } from "./boards-view";

export const metadata: Metadata = {
  title: "My Boards — Kanban AI",
};

export default function BoardsPage() {
  return <BoardsView />;
}
