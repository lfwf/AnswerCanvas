"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NoteDocument } from "@/features/notes/note-schema";
import { useHandwritingPlayer } from "@/features/handwriting/use-handwriting-player";
import { PaperPage } from "./PaperPage";
import { useLaidOutNote } from "./use-laid-out-note";
import "./paper.css";
import "./font.css";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { if (typeof matchMedia === "undefined") return; const media = matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  return reduced;
}
export function PaperStage({ note, loading, error }: { note: NoteDocument | null; loading?: boolean; error?: string | null }) {
  const layout = useLaidOutNote(note); const viewportRef = useRef<HTMLDivElement>(null); const [scale, setScale] = useState(0.72); const [currentPage, setCurrentPage] = useState(0); const reducedMotion = useReducedMotion();
  const followPage = useCallback((pageIndex: number) => { setCurrentPage(pageIndex); const viewport = viewportRef.current; const target = viewport?.querySelector<HTMLElement>(`[data-page-index="${pageIndex}"]`); target?.scrollIntoView({ behavior: "smooth", block: "center" }); viewport?.dispatchEvent(new CustomEvent("handwriting:page-follow", { detail: { pageIndex } })); }, []);
  const player = useHandwritingPlayer(layout, { reducedMotion, onPageFollow: followPage });
  useEffect(() => { const viewport = viewportRef.current; if (!viewport || typeof ResizeObserver === "undefined") return; const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, Math.max(0.32, (entry.contentRect.width - 32) / 794)))); observer.observe(viewport); return () => observer.disconnect(); }, []);
  const activeElementId = useMemo(() => Object.entries(player.progress).find(([, value]) => value > 0 && value < 1)?.[0]?.replace(/:(text|labels|path|edge.*|series.*|annotation.*)$/u, "") ?? null, [player.progress]);
  if (loading || (note && !layout)) return <section className="paper-empty"><div className="paper-loading">正在整理笔记…</div></section>;
  if (error) return <section className="paper-empty"><div className="paper-error"><strong>笔记生成失败</strong><span>{error}</span></div></section>;
  if (!note || !layout) return <section className="paper-empty"><div><strong>右侧是你的 AI 手写笔记</strong><p>输入问题后，回答会在这里逐步写出来。</p></div></section>;
  return <section className="paper-stage">
    <div className="paper-toolbar" aria-label="播放控制"><button type="button" disabled={player.status === "complete" || player.status === "idle"} onClick={player.status === "playing" ? player.pause : player.resume}>{player.status === "playing" ? "暂停" : player.status === "paused" ? "继续" : "已完成"}</button><button type="button" onClick={player.replay}>重播</button><label>速度<select value={player.speed} onChange={(event) => player.setSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></label><span>{currentPage + 1} / {layout.pages.length}</span></div>
    <div className="paper-viewport" ref={viewportRef} onWheel={player.suppressFollow} onTouchMove={player.suppressFollow}>{layout.pages.map((page) => <PaperPage key={page.index} page={page} progress={player.progress} scale={scale} activeElementId={activeElementId} penVisible={!reducedMotion && player.status === "playing"} />)}</div>
  </section>;
}
