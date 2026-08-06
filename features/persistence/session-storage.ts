import { chatResultSchema } from "@/features/notes/note-schema";
import type { ChatState, ChatTurn } from "@/features/chat/chat-types";
export const STORAGE_KEY = "answer-canvas:session";
const MAX_BYTES = 2 * 1024 * 1024; const MAX_TURNS = 20;
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; }
interface Envelope { version: 1; conversations: ChatTurn[]; selectedMessageId?: string; }
export interface PersistenceResult { state: ChatState; warning?: string; }
function validTurn(raw: unknown): ChatTurn | null {
  if (!raw || typeof raw !== "object") return null; const turn = raw as Record<string, unknown>;
  if (typeof turn.id !== "string" || typeof turn.question !== "string" || typeof turn.requestId !== "number" || typeof turn.createdAt !== "number" || typeof turn.attempt !== "number" || !["submitting", "success", "error"].includes(String(turn.status))) return null;
  const result = turn.result === undefined ? undefined : chatResultSchema.safeParse(turn.result); if (result && !result.success) return null;
  return { id: turn.id, question: turn.question, requestId: turn.requestId, createdAt: turn.createdAt, attempt: turn.attempt, status: turn.status as ChatTurn["status"], ...(typeof turn.answer === "string" ? { answer: turn.answer } : {}), ...(result?.success ? { result: result.data } : {}), ...(turn.error && typeof turn.error === "object" ? { error: { message: String((turn.error as Record<string, unknown>).message ?? "请求失败"), retryable: Boolean((turn.error as Record<string, unknown>).retryable) } } : {}) };
}
export function loadSession(storage: StorageLike): PersistenceResult {
  try {
    const value = storage.getItem(STORAGE_KEY); if (!value) return { state: { turns: [] } }; const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || (parsed as Record<string, unknown>).version !== 1 || !Array.isArray((parsed as Record<string, unknown>).conversations)) throw new Error("unknown session version");
    const seen = new Set<string>(); const turns: ChatTurn[] = [];
    for (const item of (parsed as Envelope).conversations) { const turn = validTurn(item); if (turn && !seen.has(turn.id)) { seen.add(turn.id); turns.push(turn); } }
    const selected = typeof (parsed as Envelope).selectedMessageId === "string" && seen.has((parsed as Envelope).selectedMessageId!) ? (parsed as Envelope).selectedMessageId : undefined;
    return { state: { turns, selectedMessageId: selected } };
  } catch { try { storage.removeItem(STORAGE_KEY); } catch {} return { state: { turns: [] }, warning: "本地历史已损坏，已安全重置" }; }
}
export function saveSession(storage: StorageLike, state: ChatState): { persistedTurns: number; warning?: string } {
  let conversations = state.turns.slice(-MAX_TURNS); const encoder = new TextEncoder();
  const serialize = () => {
    const retainedIds = new Set(conversations.map((turn) => turn.id));
    return JSON.stringify({ version: 1, conversations, ...(state.selectedMessageId && retainedIds.has(state.selectedMessageId) ? { selectedMessageId: state.selectedMessageId } : {}) } satisfies Envelope);
  };
  while (conversations.length && encoder.encode(serialize()).byteLength > MAX_BYTES) conversations = conversations.slice(1);
  if (!conversations.length && state.turns.length) return { persistedTurns: 0, warning: "最新记录过大，仅保留在当前页面" };
  try { storage.setItem(STORAGE_KEY, serialize()); return { persistedTurns: conversations.length, ...(conversations.length < state.turns.length ? { warning: "较早的历史已按容量限制清理" } : {}) }; }
  catch { return { persistedTurns: 0, warning: "浏览器存储不可用，历史仅保留在当前页面" }; }
}
