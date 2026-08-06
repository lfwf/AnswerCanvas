"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatResult, NoteDocument } from "@/features/notes/note-schema";
import { useHandwritingPlayer } from "@/features/handwriting/use-handwriting-player";
import { PaperPage } from "./PaperPage";
import { useLaidOutNote } from "./use-laid-out-note";
import "./font.css";
import "./paper.css";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

const modeLabel = (mode?: ChatResult["mode"]) => mode === "demo" ? "Demo" : mode === "openai" ? "OpenAI" : mode === "fallback" ? "Fallback" : "";

export function PaperStage({ note, question, mode, loading, error }: { note: NoteDocument | null; question?: string; mode?: ChatResult["mode"]; loading?: boolean; error?: string | null }) {
  const layout = useLaidOutNote(note);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.78);
  const [currentPage, setCurrentPage] = useState(0);
  const reducedMotion = useReducedMotion();
  const followPage = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
    const viewport = viewportRef.current;
    const target = viewport?.querySelector<HTMLElement>(`[data-page-index="${pageIndex}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    viewport?.dispatchEvent(new CustomEvent("handwriting:page-follow", { detail: { pageIndex } }));
  }, []);
  const player = useHandwritingPlayer(layout, { reducedMotion, onPageFollow: followPage });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const widthScale = (entry.contentRect.width - 48) / 794;
      const heightScale = (entry.contentRect.height - 54) / 1123;
      setScale(Math.min(1, Math.max(0.36, Math.min(widthScale, heightScale))));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  if (loading || (note && !layout)) return <section className="paper-stage canvas-waiting">
    <div className="canvas-status">Working…</div>
    {question && <div className="pending-question-bubble">{question}</div>}
    <div className="thinking-stroke"><span /><span /><span /></div>
  </section>;
  if (error) return <section className="paper-stage canvas-waiting">
    {question && <div className="pending-question-bubble">{question}</div>}
    <div className="canvas-error"><strong>生成失败</strong><span>{error}</span></div>
  </section>;
  if (!note || !layout) return <section className="paper-stage canvas-empty"><div><strong>Ask anything.</strong><p>答案会像草稿一样逐步写出来。</p></div></section>;

  return <section className="paper-stage">
    <div className="canvas-status">Generated {modeLabel(mode) && `· ${modeLabel(mode)}`}</div>
    <div className="paper-toolbar" aria-label="播放控制">
      <button type="button" disabled={player.status === "complete" || player.status === "idle"} onClick={player.status === "playing" ? player.pause : player.resume}>{player.status === "playing" ? "暂停" : player.status === "paused" ? "继续" : "完成"}</button>
      <button type="button" onClick={player.replay}>重播</button>
      <select aria-label="播放速度" value={player.speed} onChange={(event) => player.setSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
      {layout.pages.length > 1 && <span>{currentPage + 1}/{layout.pages.length}</span>}
    </div>
    <div className="paper-viewport" ref={viewportRef} onWheel={player.suppressFollow} onTouchMove={player.suppressFollow}>
      {layout.pages.map((page) => <PaperPage key={page.index} page={page} progress={player.progress} scale={scale} activeElementId={null} penVisible={false} />)}
    </div>
  </section>;
}
