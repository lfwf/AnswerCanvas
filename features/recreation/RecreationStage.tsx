"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { splitGraphemes } from "@/lib/text/graphemes";
import { RecreationPlayer, type RecreationEvent } from "./recreation-player";
import type { RecreationElement, RecreationScene, RecreationText } from "./recreation-types";
import "@/features/paper/font.css";
import "./recreation.css";

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

function unitsFor(element: RecreationElement) {
  return element.kind === "text" ? splitGraphemes(element.text).length : 1;
}

function durationFor(element: RecreationElement) {
  return element.kind === "text" ? Math.max(420, unitsFor(element) * 38) : 560;
}

function classForUnit(unit: string) {
  return /[A-Za-z0-9]/u.test(unit) ? "recreation-char latin-handwritten" : "recreation-char";
}

function TextElement({ element, progress }: { element: RecreationText; progress: number }) {
  const units = splitGraphemes(element.text);
  const visible = Math.floor(units.length * Math.min(1, Math.max(0, progress)));
  const style = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    color: element.style?.color,
    fontSize: element.style?.fontSize,
    lineHeight: element.style?.lineHeight ? `${element.style.lineHeight}px` : undefined,
    fontWeight: element.style?.fontWeight,
    textAlign: element.style?.textAlign,
    letterSpacing: element.style?.letterSpacing,
    transform: element.style?.rotate ? `rotate(${element.style.rotate}deg)` : undefined,
  } as React.CSSProperties;
  return <div className="recreation-text" style={style} aria-label={element.text}>
    {units.slice(0, visible).map((unit, index) => <span className={classForUnit(unit)} key={`${index}-${unit}`}>{unit === " " ? "\u00a0" : unit}</span>)}
    {visible === 0 && "\u00a0"}
  </div>;
}

function SvgElements({ elements, progress }: { elements: RecreationElement[]; progress: Record<string, number> }) {
  return <svg className="recreation-ink" viewBox="0 0 908 1280" aria-hidden="true">
    {elements.map((element) => {
      const value = progress[element.id] ?? 0;
      if (element.kind === "stroke") return <path key={element.id} d={element.path} pathLength="1" fill="none" stroke={element.color ?? "#171717"} strokeWidth={element.width ?? 1.4} strokeOpacity={(element.opacity ?? 1) * value} strokeDasharray={element.dash ?? "none"} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: element.dash ? undefined : 1, strokeDashoffset: element.dash ? undefined : 1 - value }} />;
      if (element.kind === "box") return <rect key={element.id} x={element.x} y={element.y} width={element.width} height={element.height} rx={element.radius ?? 0} fill={value >= 1 ? (element.fill ?? "none") : "none"} stroke={element.stroke ?? "#171717"} strokeOpacity={value} strokeWidth={element.strokeWidth ?? 1.4} strokeDasharray={element.dash ?? undefined} pathLength="1" style={{ strokeDasharray: element.dash ? undefined : 1, strokeDashoffset: element.dash ? undefined : 1 - value }} />;
      return null;
    })}
  </svg>;
}

export function RecreationStage({ scene }: { scene: RecreationScene }) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<RecreationPlayer | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [scale, setScale] = useState(0.7);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [speed, setSpeed] = useState(1);
  const elements = useMemo(() => [...scene.elements].sort((a, b) => a.order - b.order), [scene.elements]);
  const events = useMemo<RecreationEvent[]>(() => elements.map((element) => ({ id: element.id, durationMs: durationFor(element) })), [elements]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, Math.max(0.32, (entry.contentRect.width - 36) / scene.width))));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scene.width]);

  useEffect(() => {
    const player = new RecreationPlayer({
      events,
      onProgress: (event, value) => setProgress((current) => ({ ...current, [event.id]: value })),
      onComplete: () => setStatus("complete"),
    });
    playerRef.current = player;
    if (reducedMotion) {
      const complete: Record<string, number> = {};
      for (const event of events) complete[event.id] = 1;
      setProgress(complete);
      setStatus("complete");
    } else {
      setProgress({});
      const startTimer = window.setTimeout(() => { player.play(); setStatus("playing"); }, 350);
      return () => { window.clearTimeout(startTimer); player.pause(); };
    }
    return () => player.pause();
  }, [events, reducedMotion]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || status === "complete") return;
    if (status === "playing") { player.pause(); setStatus("paused"); }
    else { player.resume(); setStatus("playing"); }
  }, [status]);

  const replay = useCallback(() => {
    if (!playerRef.current) return;
    setProgress({});
    playerRef.current.replay();
    setStatus("playing");
  }, []);

  const changeSpeed = useCallback((next: number) => { setSpeed(next); playerRef.current?.setSpeed(next); }, []);

  return <main className="recreation-shell">
    <header className="recreation-brand" aria-label="AnswerCanvas">
      <div className="brand-mark">AC</div>
      <div><h1>AnswerCanvas</h1><p>Codex image recreation</p></div>
    </header>
    <aside className="recreation-handoff">
      <strong>图片转手写</strong>
      <span>把图片发给 Codex，说“转成手写”，它会更新当前复刻场景。</span>
      <small>{scene.sourceName}</small>
    </aside>
    <section className="recreation-viewport" ref={viewportRef} aria-label="手写复刻画布">
      <div className="recreation-paper-shell" style={{ width: scene.width * scale, height: scene.height * scale }}>
        <article className="recreation-paper" style={{ width: scene.width, height: scene.height, transform: `scale(${scale})` }}>
          <SvgElements elements={elements} progress={progress} />
          {elements.filter((element): element is RecreationText => element.kind === "text").map((element) => <TextElement key={element.id} element={element} progress={progress[element.id] ?? 0} />)}
        </article>
      </div>
    </section>
    <div className="recreation-status">{status === "complete" ? "已完成" : status === "paused" ? "已暂停" : status === "playing" ? "正在书写" : "准备开始"}</div>
    <nav className="recreation-toolbar" aria-label="播放控制">
      <button type="button" onClick={togglePlay} disabled={status === "complete"}>{status === "playing" ? "暂停" : "继续"}</button>
      <button type="button" onClick={replay}>重播</button>
      <select aria-label="播放速度" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
    </nav>
  </main>;
}
