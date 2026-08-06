import { chatResultSchema, defaultNoteTheme, type ChatResult } from "./note-schema";
import { splitGraphemes } from "@/lib/text/graphemes";
import type { IdGenerator } from "./demo-note";

const defaultId: IdGenerator = () => crypto.randomUUID();
export function createFallbackChatResult(question: string, safeText: string, idGenerator: IdGenerator = defaultId): ChatResult {
  const text = safeText.trim() || "暂时无法生成完整笔记，请重试";
  const answer = splitGraphemes(text).slice(0, 6000).join("");
  const clipped = splitGraphemes(answer).slice(0, 240).join("");
  return chatResultSchema.parse({
    answer, mode: "fallback",
    note: { id: idGenerator(), question, title: "回答摘要", theme: defaultNoteTheme, blocks: [{ type: "text", id: idGenerator(), spans: [{ id: idGenerator(), text: clipped }] }], arrows: [], truncated: answer !== clipped },
  });
}
