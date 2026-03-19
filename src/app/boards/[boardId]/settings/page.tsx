import type { Metadata } from "next";
import { BoardSettingsView } from "./board-settings-view";

interface BoardSettingsPageProps {
  params: Promise<{ boardId: string }>;
}

export const metadata: Metadata = {
  title: "Board Settings — Kanban AI",
};

export default async function BoardSettingsPage({
  params,
}: BoardSettingsPageProps) {
  const { boardId } = await params;
  return <BoardSettingsView boardId={boardId} />;
}
