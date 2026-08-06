"use client";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { ChatState } from "./chat-types";

export function ChatPanel({ state, onSubmit, onRetry, onSelect }: { state: ChatState; onSubmit(question: string): void; onRetry(id: string): void; onSelect(id: string): void }) {
  const [value, setValue] = useState("");
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const question = value.trim();
    if (!question) return;
    onSubmit(question);
    setValue("");
  };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return <section className="chat-panel">
    <header className="brand" aria-label="AnswerCanvas">
      <div className="brand-mark">AC</div>
      <div><h1>AnswerCanvas</h1><p>AI visual reasoning</p></div>
    </header>

    <details className="history-drawer">
      <summary>历史 {state.turns.length ? `· ${state.turns.length}` : ""}</summary>
      <div className="conversation-list" aria-live="polite">
        {state.turns.length === 0 && <p className="history-empty">还没有生成记录。</p>}
        {state.turns.map((turn) => <article key={turn.id} className={`turn ${state.selectedMessageId === turn.id ? "selected" : ""}`} onClick={() => onSelect(turn.id)}>
          <div className="user-bubble">{turn.question}</div>
          <div className="assistant-bubble">
            {turn.status === "submitting" && <span className="typing">正在生成…</span>}
            {turn.answer && <p>{turn.answer}</p>}
            {turn.result && <span className={`mode-badge mode-${turn.result.mode}`}>{turn.result.mode === "demo" ? "演示" : turn.result.mode === "openai" ? "OpenAI" : "降级"}</span>}
            {turn.status === "error" && <div className="turn-error"><span>{turn.error?.message}</span>{turn.error?.retryable && <button type="button" onClick={(event) => { event.stopPropagation(); onRetry(turn.id); }}>重试</button>}</div>}
          </div>
        </article>)}
      </div>
    </details>

    {state.persistenceWarning && <div className="storage-warning" role="status">{state.persistenceWarning}</div>}

    <form className="composer" onSubmit={submit}>
      {state.turns.length === 0 && <div className="composer-suggestions"><button type="button" onClick={() => setValue("什么是 Skill？")}>什么是 Skill？</button><button type="button" onClick={() => setValue("比较 NVIDIA 和 AMD 的长期表现")}>比较 NVIDIA 和 AMD</button></div>}
      <div className="composer-box">
        <label className="sr-only" htmlFor="question">输入你的问题</label>
        <textarea id="question" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={keyDown} maxLength={12000} placeholder="Ask anything…" rows={2} />
        <div className="composer-actions"><span>Enter 发送 · Shift + Enter 换行</span><button type="submit" aria-label="生成手写笔记" disabled={!value.trim()}>→</button></div>
      </div>
    </form>
  </section>;
}
