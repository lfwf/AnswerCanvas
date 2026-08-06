"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { chatResultSchema } from "@/features/notes/note-schema";
import { chatReducer, initialChatState } from "./chat-reducer";
import { loadSession, saveSession } from "@/features/persistence/session-storage";

export function useChatSession() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState); const [hydrated, setHydrated] = useState(false); const requestId = useRef(0); const controllers = useRef(new Map<string, AbortController>());
  useEffect(() => { const loaded = loadSession(localStorage); dispatch({ type: "hydrate", state: loaded.state }); if (loaded.warning) dispatch({ type: "persistence-warning", message: loaded.warning }); setHydrated(true); return () => { for (const controller of controllers.current.values()) controller.abort(); }; }, []);
  useEffect(() => { if (!hydrated) return; const saved = saveSession(localStorage, state); if (saved.warning && saved.warning !== state.persistenceWarning) dispatch({ type: "persistence-warning", message: saved.warning }); }, [hydrated, state.turns, state.selectedMessageId, state.persistenceWarning]);
  const execute = useCallback(async (id: string, question: string, currentRequestId: number) => {
    controllers.current.get(id)?.abort(); const controller = new AbortController(); controllers.current.set(id, controller);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }), signal: controller.signal });
      const payload = await response.json() as unknown;
      if (!response.ok) { const error = payload && typeof payload === "object" ? (payload as Record<string, unknown>).error as Record<string, unknown> | undefined : undefined; throw Object.assign(new Error(String(error?.message ?? "请求失败")), { retryable: Boolean(error?.retryable) }); }
      const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>).data : undefined; const result = chatResultSchema.parse(data); dispatch({ type: "success", id, requestId: currentRequestId, result });
    } catch (error) { if (controller.signal.aborted) return; dispatch({ type: "error", id, requestId: currentRequestId, message: error instanceof Error ? error.message : "请求失败", retryable: Boolean((error as { retryable?: boolean })?.retryable ?? true) }); }
    finally { if (controllers.current.get(id) === controller) controllers.current.delete(id); }
  }, []);
  const submit = useCallback((question: string) => { const normalized = question.trim(); if (!normalized) return; const id = crypto.randomUUID(); const nextRequestId = ++requestId.current; dispatch({ type: "submit", turn: { id, requestId: nextRequestId, question: normalized, status: "submitting", attempt: 1, createdAt: Date.now() } }); void execute(id, normalized, nextRequestId); }, [execute]);
  const retry = useCallback((id: string) => { const turn = state.turns.find((item) => item.id === id); if (!turn) return; const nextRequestId = ++requestId.current; dispatch({ type: "retry", id, requestId: nextRequestId }); void execute(id, turn.question, nextRequestId); }, [execute, state.turns]);
  return { state, submit, retry, select: (id: string) => dispatch({ type: "select", id }) };
}
