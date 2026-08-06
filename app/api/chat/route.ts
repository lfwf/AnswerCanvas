import { NextResponse } from "next/server";
import { countGraphemes } from "@/lib/text/graphemes";
import { ChatServiceError, createChatServiceFromEnv } from "@/lib/ai/chat-service";
export async function POST(request: Request) {
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "请求体必须是 JSON", retryable: false } }, { status: 400 }); }
  const question = body && typeof body === "object" ? (body as Record<string, unknown>).question : undefined;
  if (typeof question !== "string" || !question.trim()) return NextResponse.json({ error: { code: "INVALID_QUESTION", message: "请输入问题", retryable: false } }, { status: 400 });
  const normalized = question.trim(); if (countGraphemes(normalized) > 4000) return NextResponse.json({ error: { code: "QUESTION_TOO_LONG", message: "问题不能超过 4000 个字符", retryable: false } }, { status: 400 });
  try { const data = await createChatServiceFromEnv().answer(normalized, request.signal); return NextResponse.json({ data }); }
  catch (error) { if (error instanceof ChatServiceError) return NextResponse.json({ error: { code: error.code, message: error.message, retryable: error.retryable } }, { status: error.code === "TIMEOUT" ? 504 : 502 }); return NextResponse.json({ error: { code: "UPSTREAM", message: "服务暂时不可用", retryable: true } }, { status: 502 }); }
}
