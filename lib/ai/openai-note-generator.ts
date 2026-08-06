import "server-only";
import OpenAI from "openai";
import { RAW_AI_JSON_SCHEMA, SYSTEM_PROMPT } from "./prompt";

export interface NoteGenerator {
  generate(question: string, signal: AbortSignal): Promise<unknown>;
  repair(invalid: unknown, diagnostics: string[], signal: AbortSignal): Promise<unknown>;
}

interface ResponsesClient {
  responses: {
    create(input: unknown, options?: { signal?: AbortSignal }): Promise<{ output_text?: string }>;
  };
}

function parseOutput(response: { output_text?: string }): unknown {
  if (!response.output_text) throw new Error("OpenAI returned no structured content");
  return JSON.parse(response.output_text);
}

export function composeAbortSignal(callerSignal: AbortSignal, timeoutMs = 30_000): { signal: AbortSignal; cleanup(): void } {
  const controller = new AbortController();
  const forwardCallerAbort = () => controller.abort(callerSignal.reason);
  callerSignal.addEventListener("abort", forwardCallerAbort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("OpenAI request timed out", "TimeoutError")), timeoutMs);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      callerSignal.removeEventListener("abort", forwardCallerAbort);
    },
  };
}

export class OpenAINoteGenerator implements NoteGenerator {
  private readonly client: ResponsesClient;
  private readonly model: string;

  constructor(options: { apiKey: string; model?: string; client?: ResponsesClient }) {
    this.client = options.client ?? (new OpenAI({ apiKey: options.apiKey }) as unknown as ResponsesClient);
    this.model = options.model ?? "gpt-5-mini";
  }

  async generate(question: string, callerSignal: AbortSignal): Promise<unknown> {
    const composed = composeAbortSignal(callerSignal);
    try {
      const response = await this.client.responses.create({
        model: this.model,
        instructions: SYSTEM_PROMPT,
        input: question,
        text: { format: { type: "json_schema", name: "answer_canvas_note", strict: true, schema: RAW_AI_JSON_SCHEMA } },
      }, { signal: composed.signal });
      return parseOutput(response);
    } catch (error) {
      if (composed.signal.aborted) throw composed.signal.reason ?? error;
      throw error;
    } finally {
      composed.cleanup();
    }
  }

  async repair(invalid: unknown, diagnostics: string[], callerSignal: AbortSignal): Promise<unknown> {
    const composed = composeAbortSignal(callerSignal);
    try {
      const response = await this.client.responses.create({
        model: this.model,
        instructions: `${SYSTEM_PROMPT}\n修复下面的 JSON，使其满足同一 Schema。不要改变事实，不要添加 question。`,
        input: JSON.stringify({ invalid, diagnostics: diagnostics.slice(0, 20) }),
        text: { format: { type: "json_schema", name: "answer_canvas_note_repair", strict: true, schema: RAW_AI_JSON_SCHEMA } },
      }, { signal: composed.signal });
      return parseOutput(response);
    } catch (error) {
      if (composed.signal.aborted) throw composed.signal.reason ?? error;
      throw error;
    } finally {
      composed.cleanup();
    }
  }
}
