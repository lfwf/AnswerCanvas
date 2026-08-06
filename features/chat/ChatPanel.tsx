"use client";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { ChatState } from "./chat-types";
export function ChatPanel({ state, onSubmit, onRetry, onSelect }: { state: ChatState; onSubmit(question: string): void; onRetry(id: string): void; onSelect(id: string): void }) {
  const [value, setValue] = useState("");
  const submit = (event?: FormEvent) => { event?.preventDefault(); const question = value.trim(); if (!question) return; onSubmit(question); setValue(""); };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit(); };
  return <section className="chat-panel"><header className="brand"><div className="brand-mark">AC</div><div><h1>把 AI 回答写在纸上</h1><p>AnswerCanvas</p></div></header>
    <div className="conversation-list" aria-live="polite">{state.turns.length === 0 && <div className="welcome"><span>试着问：</span><button type="button" onClick={() => setValue("什么是 Skill？")}>什么是 Skill？</button><button type="button" onClick={() => setValue("解释一下 RAG 的工作流程")}>RAG 如何工作？</button></div>}
      {state.turns.map((turn) => <article key={turn.id} className={`turn ${state.selectedMessageId === turn.id ? "selected" : ""}`} onClick={() => onSelect(turn.id)}><div className="user-bubble">{turn.question}</div><div className="assistant-bubble">{turn.status === "submitting" && <span className="typing">正在思考并整理笔记…</span>}{turn.answer && <p>{turn.answer}</p>}{turn.result && <span className={`mode-badge mode-${turn.result.mode}`}>{turn.result.mode === "demo" ? "演示模式" : turn.result.mode === "openai" ? "OpenAI" : "安全降级"}</span>}{turn.status === "error" && <div className="turn-error"><span>{turn.error?.message}</span>{turn.error?.retryable && <button type="button" onClick={(event) => { event.stopPropagation(); onRetry(turn.id); }}>重试</button>}</div>}</div></article>)}
    </div>
    {state.persistenceWarning && <div className="storage-warning" role="status">{state.persistenceWarning}</div>}
    <form className="composer" onSubmit={submit}><label htmlFor="question">输入你的问题</label><textarea id="question" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={keyDown} maxLength={12000} placeholder="例如：什么是 Skill？" rows={4} /><div><span>Ctrl / ⌘ + Enter 发送</span><button type="submit" disabled={!value.trim()}>生成手写笔记</button></div></form>
  </section>;
}
