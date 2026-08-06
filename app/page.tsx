"use client";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { useChatSession } from "@/features/chat/use-chat-session";
import { PaperStage } from "@/features/paper/PaperStage";
export default function HomePage() {
  const session = useChatSession(); const selected = session.state.turns.find((turn) => turn.id === session.state.selectedMessageId) ?? session.state.turns.at(-1);
  return <main className="app-shell"><ChatPanel state={session.state} onSubmit={session.submit} onRetry={session.retry} onSelect={session.select} /><section className="paper-pane"><PaperStage note={selected?.result?.note ?? null} loading={selected?.status === "submitting"} error={selected?.status === "error" ? selected.error?.message ?? "请求失败" : null} /></section></main>;
}
