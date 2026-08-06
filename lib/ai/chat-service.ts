import { chatResultSchema, type ChatResult } from "@/features/notes/note-schema";
import { createDemoChatResult } from "@/features/notes/demo-note";
import { createFallbackChatResult } from "@/features/notes/fallback-note";
import { normalizeNote } from "@/features/notes/normalize-note";
import { parseRawAIResult } from "@/features/notes/raw-note-schema";
import { createNvdaAmdComparisonResult, isNvdaAmdComparison } from "@/lib/market/stock-comparison";
import { splitGraphemes } from "@/lib/text/graphemes";
import type { NoteGenerator } from "./openai-note-generator";

export class ChatServiceError extends Error {
  constructor(public readonly code: "UPSTREAM" | "TIMEOUT", message: string, public readonly retryable = true) { super(message); }
}
export interface SafeLogger { warn(message: string, metadata?: Record<string, unknown>): void; }
const noopLogger: SafeLogger = { warn() {} };
function extractSafeAnswer(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const answer = (raw as Record<string, unknown>).answer;
  if (typeof answer !== "string" || !answer.trim()) return null;
  return splitGraphemes(answer.trim()).slice(0, 6000).join("");
}
function mapTransportError(error: unknown): ChatServiceError {
  if (error instanceof DOMException && error.name === "TimeoutError") return new ChatServiceError("TIMEOUT", "AI 响应超时，请重试");
  return new ChatServiceError("UPSTREAM", "AI 服务暂时不可用，请重试");
}

type StockComparisonProvider = (question: string, signal: AbortSignal) => Promise<ChatResult>;

export class ChatService {
  constructor(private readonly options: { apiKey?: string; generator?: NoteGenerator; logger?: SafeLogger; idGenerator?: () => string; stockComparisonProvider?: StockComparisonProvider }) {}

  async answer(question: string, signal: AbortSignal): Promise<ChatResult> {
    const logger = this.options.logger ?? noopLogger;
    if (isNvdaAmdComparison(question)) {
      try {
        const provider = this.options.stockComparisonProvider ?? ((input, requestSignal) => createNvdaAmdComparisonResult(input, requestSignal, { idGenerator: this.options.idGenerator }));
        return await provider(question, signal);
      } catch (error) {
        logger.warn("live market comparison unavailable", { error: error instanceof Error ? error.name : "unknown" });
        if (!this.options.apiKey) return createDemoChatResult(question, this.options.idGenerator);
      }
    }

    if (!this.options.apiKey) return createDemoChatResult(question, this.options.idGenerator);
    const generator = this.options.generator ?? await this.createDefaultGenerator();
    let raw: unknown;
    try { raw = await generator.generate(question, signal); }
    catch (error) { if (signal.aborted) throw new ChatServiceError("UPSTREAM", "请求已取消"); throw mapTransportError(error); }
    let safeText = extractSafeAnswer(raw) ?? "暂时无法生成完整笔记，请重试";
    try {
      const parsed = parseRawAIResult(raw); safeText = parsed.value.answer; const normalized = normalizeNote(parsed.value.note, question);
      return chatResultSchema.parse({ answer: parsed.value.answer, note: normalized.note, mode: "openai" });
    } catch (firstError) {
      const diagnostics = [firstError instanceof Error ? firstError.message : "structured output validation failed"];
      logger.warn("structured note requires repair", { diagnostics: diagnostics.slice(0, 3) });
      try {
        const repairedRaw = await generator.repair(raw, diagnostics, signal); safeText = extractSafeAnswer(repairedRaw) ?? safeText; const repaired = parseRawAIResult(repairedRaw); const normalized = normalizeNote(repaired.value.note, question);
        return chatResultSchema.parse({ answer: repaired.value.answer, note: normalized.note, mode: "openai" });
      } catch (repairError) {
        logger.warn("structured note repair failed; using safe fallback", { error: repairError instanceof Error ? repairError.name : "unknown" });
        return createFallbackChatResult(question, safeText, this.options.idGenerator);
      }
    }
  }

  private async createDefaultGenerator(): Promise<NoteGenerator> {
    const { OpenAINoteGenerator } = await import("./openai-note-generator");
    return new OpenAINoteGenerator({ apiKey: this.options.apiKey!, model: process.env.OPENAI_MODEL });
  }
}
export function createChatServiceFromEnv(): ChatService { return new ChatService({ apiKey: process.env.OPENAI_API_KEY }); }
