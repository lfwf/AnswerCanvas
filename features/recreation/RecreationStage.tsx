"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawableGraphemes } from "./recreation-geometry";
import { RecreationCanvas } from "./RecreationCanvas";
import { RecreationPlayer, type RecreationEvent } from "./recreation-player";
import type { RecreationAnimatedElement, RecreationScene } from "./recreation-types";
import { isAnimatedElement } from "./recreation-types";
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

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const timeout = new Promise<void>((resolve) => { timer = window.setTimeout(resolve, 3000); });
    const fonts = typeof document !== "undefined" && "fonts" in document ? document.fonts.ready.then(() => undefined, () => undefined) : Promise.resolve();
    Promise.race([fonts, timeout]).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);
  return ready;
}

function unitsFor(element: RecreationAnimatedElement) {
  if (element.kind === "text") return drawableGraphemes(element.text).length;
  if (element.kind === "mark") return Math.max(1, drawableGraphemes(element.match).length);
  return 1;
}

export function durationForElement(element: RecreationAnimatedElement) {
  if (element.kind === "text") return Math.max(260, unitsFor(element) * 58);
  if (element.kind === "mark") return Math.max(300, unitsFor(element) * 32);
  if (element.kind === "box") return element.handDrawn === false ? 620 : 1180;
  return element.handDrawn === false ? 520 : 760;
}

export function timelineElements(scene: RecreationScene): RecreationAnimatedElement[] {
  return scene.elements.filter(isAnimatedElement).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function RecreationStage({ scene }: { scene: RecreationScene }) {
  const reducedMotion = useReducedMotion();
  const fontsReady = useFontsReady();
  const viewportRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<RecreationPlayer | null>(null);
  const speedRef = useRef(1);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [scale, setScale] = useState(0.7);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [speed, setSpeed] = useState(1);
  const elements = useMemo(() => timelineElements(scene), [scene]);
  const events = useMemo<RecreationEvent[]>(() => elements.map((element) => ({ id: element.id, durationMs: durationForElement(element) })), [elements]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const update = (width: number) => setScale(Math.min(1, Math.max(0.28, (width - 36) / scene.width)));
    update(viewport.clientWidth);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scene.width]);

  useEffect(() => {
    if (!fontsReady) return;
    let active = true;
    const player = new RecreationPlayer({
      events,
      onProgress: (event, value) => { if (active) setProgress((current) => ({ ...current, [event.id]: value })); },
      onComplete: () => { if (active) setStatus("complete"); },
    });
    player.setSpeed(speedRef.current);
    playerRef.current = player;
    if (reducedMotion) {
      setProgress(Object.fromEntries(events.map((event) => [event.id, 1])));
      setStatus("complete");
      return () => { active = false; player.pause(); if (playerRef.current === player) playerRef.current = null; };
    }
    setProgress({});
    setStatus("idle");
    const startTimer = window.setTimeout(() => { if (!active) return; player.play(); setStatus("playing"); }, 350);
    return () => {
      active = false;
      window.clearTimeout(startTimer);
      player.pause();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [events, fontsReady, reducedMotion, scene.id]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || status === "complete") return;
    if (status === "playing") { player.pause(); setStatus("paused"); }
    else { player.resume(); setStatus("playing"); }
  }, [status]);

  const replay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    setProgress({});
    player.replay();
    setStatus("playing");
  }, []);

  const changeSpeed = useCallback((next: number) => {
    speedRef.current = next;
    setSpeed(next);
    playerRef.current?.setSpeed(next);
  }, []);

  return <main className="recreation-shell">
    <header className="recreation-brand" aria-label="AnswerCanvas">
      <Link className="brand-mark" href="/" aria-label="返回场景列表">AC</Link>
      <div><h1>AnswerCanvas</h1><p>{scene.title}</p></div>
    </header>
    <aside className="recreation-handoff"><strong>图片转手写</strong><span>发送新图片后会新增独立场景并保留已有场景。</span><small>{scene.sourceName}</small></aside>
    <section className="recreation-viewport" ref={viewportRef} aria-label={`${scene.title} 手写复刻画布`}>
      <div className="recreation-paper-shell" style={{ width: scene.width * scale, height: scene.height * scale }}>
        <div className="recreation-canvas-transform" style={{ width: scene.width, height: scene.height, transform: `scale(${scale})` }}>
          <RecreationCanvas scene={scene} progress={progress} />
        </div>
      </div>
    </section>
    <div className="recreation-status">{!fontsReady ? "正在加载字体" : status === "complete" ? "已完成" : status === "paused" ? "已暂停" : status === "playing" ? "正在书写" : "准备开始"}</div>
    <nav className="recreation-toolbar" aria-label="播放控制">
      <Link className="recreation-toolbar-link" href="/">场景列表</Link>
      <button type="button" onClick={togglePlay} disabled={status === "complete" || !fontsReady}>{status === "playing" ? "暂停" : "继续"}</button>
      <button type="button" onClick={replay} disabled={!fontsReady}>重播</button>
      <select aria-label="播放速度" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
    </nav>
  </main>;
}
