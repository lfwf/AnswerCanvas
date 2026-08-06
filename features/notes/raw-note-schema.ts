import { countGraphemes } from "@/lib/text/graphemes";

export interface RawAIResult { answer: string; note: Record<string, unknown>; }
export interface RawParseResult { value: RawAIResult; diagnostics: string[]; }
const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

function assertBounded(value: unknown, depth = 0): void {
  if (depth > 12) throw new Error("raw JSON nesting exceeds limit");
  if (typeof value === "string") { if (countGraphemes(value) > 12000) throw new Error("raw string exceeds limit"); return; }
  if (value === null || typeof value === "number" || typeof value === "boolean") return;
  if (Array.isArray(value)) { if (value.length > 200) throw new Error("raw array exceeds limit"); for (const item of value) assertBounded(item, depth + 1); return; }
  if (typeof value !== "object") throw new Error("unsupported raw JSON value");
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 100) throw new Error("raw object exceeds limit");
  for (const [key, child] of entries) { if (blockedKeys.has(key)) throw new Error("unsafe raw JSON key"); assertBounded(child, depth + 1); }
}

export function parseRawAIResult(input: unknown): RawParseResult {
  assertBounded(input);
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("raw result must be an object");
  const root = input as Record<string, unknown>;
  if (typeof root.answer !== "string" || countGraphemes(root.answer) < 1 || countGraphemes(root.answer) > 6000) throw new Error("raw answer must contain 1-6000 graphemes");
  if (!root.note || typeof root.note !== "object" || Array.isArray(root.note)) throw new Error("raw note must be an object");
  const note = { ...(root.note as Record<string, unknown>) };
  const diagnostics: string[] = [];
  if ("question" in note) { delete note.question; diagnostics.push("discarded AI-supplied question"); }
  return { value: { answer: root.answer, note }, diagnostics };
}
