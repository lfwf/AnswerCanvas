"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawableGraphemes } from "./recreation-geometry";
import { RecreationCanvas } from "./RecreationCanvas";
import { PageSnapshotPanel } from "./PageSnapshotPanel";
import { pagePresentationFor } from "./recreation-pages";
import { RecreationPlayer, type RecreationEvent } from "./recreation-player";
import { recordingFrameFor } from "./recreation-recording";
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
  if (element.kind === "annotation") return drawableGraphemes(element.label).length;
  if (element.kind === "mark") return Math.max(1, drawableGraphemes(element.match).length);
  return 1;
}

export function durationForElement(element: RecreationAnimatedElement) {
  if (element.kind === "page") return element.durationMs ?? 720;
  if (element.kind === "view") return element.durationMs ?? 460;
  if (element.kind === "annotation") return Math.max(260, unitsFor(element) * 52);
  if (element.kind === "text") return Math.max(260, unitsFor(element) * 58);
  if (element.kind === "mark") return Math.max(300, unitsFor(element) * 32);
  if (element.kind === "box") return element.handDrawn === false ? 620 : 1180;
  return element.handDrawn === false ? 520 : 760;
}

export function timelineElements(scene: RecreationScene): RecreationAnimatedElement[] {
  return scene.elements.filter(isAnimatedElement).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function scenePrompt(scene: RecreationScene) {
  return scene.prompt?.trim() || `请把「${scene.title}」整理成一份清晰的手写笔记。`;
}

function pageLayerStyle(role: "outgoing" | "incoming", progress: number, transition: "slide" | "fade" | "flip"): React.CSSProperties {
  if (transition === "fade") return { opacity: role === "outgoing" ? 1 - progress : progress };
  if (transition === "flip") {
    const angle = role === "outgoing" ? -108 * progress : 108 * (1 - progress);
    const shadow = role === "outgoing" ? progress : 1 - progress;
    return {
      transform: `perspective(2400px) rotateY(${angle}deg)`,
      transformOrigin: role === "outgoing" ? "100% 50%" : "0% 50%",
      boxShadow: `${role === "outgoing" ? "" : "-"}28px 0 36px rgba(0,0,0,${0.22 * shadow}) inset`,
    };
  }
  const x = role === "outgoing" ? -progress * 106 : (1 - progress) * 106;
  return { transform: `translateX(${x}%)`, opacity: role === "outgoing" ? 1 - progress * 0.18 : 0.82 + progress * 0.18 };
}

export function RecreationStage({ scene, history = [] }: { scene: RecreationScene; history?: RecreationScene[] }) {
  const reducedMotion = useReducedMotion();
  const fontsReady = useFontsReady();
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<RecreationPlayer | null>(null);
  const speedRef = useRef(1);
  const autoplayTimerRef = useRef(0);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [scale, setScale] = useState(0.7);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [speed, setSpeed] = useState(1);
  const elements = useMemo(() => timelineElements(scene), [scene]);
  const events = useMemo<RecreationEvent[]>(() => elements.map((element) => ({ id: element.id, durationMs: durationForElement(element) })), [elements]);
  const historyScenes = history.length ? history : [scene];
  const prompt = scenePrompt(scene);
  const pagePresentation = useMemo(() => pagePresentationFor(scene, progress), [progress, scene]);
  const pageForIndicator = pagePresentation.incomingPageId && pagePresentation.transitionProgress >= 0.5 ? pagePresentation.incomingPageId : pagePresentation.currentPageId;
  const pageIndex = scene.pages?.findIndex((page) => page.id === pageForIndicator) ?? -1;
  const isPagedVideo = Boolean(scene.pages?.length);
  const transparentSurface = scene.paper.background === "transparent";
  const recordingFrame = useMemo(() => recordingFrameFor(scene), [scene]);

  useEffect(() => {
    if (isPagedVideo) {
      setScale(recordingFrame.scale);
      return;
    }
    const viewport = canvasViewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const update = (width: number) => {
      const widthScale = Math.max(0.22, (width - 8) / scene.width);
      setScale(Math.min(1, widthScale));
    };
    update(viewport.clientWidth);
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isPagedVideo, recordingFrame.scale, scene.width]);

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
    const setupTimer = window.setTimeout(() => {
      if (!active) return;
      if (reducedMotion) {
        setProgress(Object.fromEntries(events.map((event) => [event.id, 1])));
        setStatus("complete");
        return;
      }
      setProgress({});
      setStatus("idle");
      autoplayTimerRef.current = window.setTimeout(() => { if (!active) return; player.play(); setStatus("playing"); }, 350);
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(setupTimer);
      window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = 0;
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
    if (!player || reducedMotion) return;
    window.clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = 0;
    setProgress({});
    player.reset();
    setStatus("paused");
  }, [reducedMotion]);

  const changeSpeed = useCallback((next: number) => {
    speedRef.current = next;
    setSpeed(next);
    playerRef.current?.setSpeed(next);
  }, []);

  const statusLabel = !fontsReady ? "正在加载字体" : status === "complete" ? "已完成" : status === "paused" ? "已暂停" : status === "playing" ? "正在书写" : "准备开始";

  return <main className={`conversation-shell${isPagedVideo ? " is-recording-layout" : ""}`}>
    {!isPagedVideo ? <aside className="conversation-sidebar" aria-label="历史记录">
      <div className="conversation-brand">
        <Link className="brand-mark" href="/" aria-label="AnswerCanvas 场景列表">AC</Link>
        <div><h1>AnswerCanvas</h1><p>Handwritten answers</p></div>
      </div>
      <Link className="new-conversation" href="/"><span>＋</span> 新对话</Link>
      <p className="history-heading">历史记录</p>
      <nav className="history-list">
        {historyScenes.map((item) => <Link className={`history-item${item.id === scene.id ? " is-active" : ""}`} href={`/scenes/${item.id}`} key={item.id} aria-current={item.id === scene.id ? "page" : undefined}>
          <span>{item.title}</span><small>{item.createdAt}</small>
        </Link>)}
      </nav>
      <div className="sidebar-note"><strong>图片转手写</strong><span>新图片会生成新的历史场景，已有回答会一直保留。</span></div>
    </aside> : null}

    <section className="conversation-panel">
      {!isPagedVideo ? <header className="conversation-topbar">
        <div className="conversation-mobile-brand"><span className="brand-mark">AC</span><strong>AnswerCanvas</strong></div>
        <div className="conversation-title"><strong>{scene.title}</strong><span>图片手写回答</span></div>
        <Link className="conversation-scenes-link" href="/">场景列表</Link>
      </header> : null}

      <div className="conversation-thread">
        {!isPagedVideo ? <div className="user-message-row"><div className="user-message">{prompt}</div></div> : null}

        <article className="assistant-message" aria-label="AnswerCanvas 手写回答">
          <header className="assistant-message-header">
            <div className="assistant-identity"><span className="assistant-avatar">AC</span><div><strong>AnswerCanvas</strong><span>{statusLabel}</span></div></div>
            <nav className="answer-controls" aria-label="播放控制">
              {scene.pages?.length ? <span className="page-indicator">{Math.max(1, pageIndex + 1)}/{scene.pages.length}</span> : null}
              <PageSnapshotPanel scene={scene} ready={fontsReady} />
              <button type="button" onClick={togglePlay} disabled={status === "complete" || !fontsReady}>{status === "playing" ? "暂停" : status === "complete" ? "完成" : "继续"}</button>
              <button type="button" onClick={replay} disabled={!fontsReady || reducedMotion}>重播</button>
              <select aria-label="播放速度" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
            </nav>
          </header>

          <div
            className={`answer-canvas-viewport${isPagedVideo ? " is-paged-video is-recording-frame" : ""}${transparentSurface ? " is-transparent-surface" : ""}`}
            ref={canvasViewportRef}
            data-recording-resolution={isPagedVideo ? `${recordingFrame.width}x${recordingFrame.height}` : undefined}
            style={isPagedVideo ? { width: recordingFrame.width, height: recordingFrame.height } : undefined}
          >
            <div className="recreation-paper-shell" style={{ width: scene.width * scale, height: scene.height * scale }}>
              <div className="recreation-canvas-transform recreation-page-stage" style={{ width: scene.width, height: scene.height, transform: `scale(${scale})` }}>
                {pagePresentation.incomingPageId && pagePresentation.outgoingPageId ? <>
                  <div className="recreation-page-layer" style={pageLayerStyle("outgoing", pagePresentation.transitionProgress, pagePresentation.transition)}><RecreationCanvas scene={scene} progress={progress} pageId={pagePresentation.outgoingPageId} /></div>
                  <div className="recreation-page-layer" style={pageLayerStyle("incoming", pagePresentation.transitionProgress, pagePresentation.transition)}><RecreationCanvas scene={scene} progress={progress} pageId={pagePresentation.incomingPageId} /></div>
                </> : <div className="recreation-page-layer"><RecreationCanvas scene={scene} progress={progress} pageId={pagePresentation.currentPageId} /></div>}
              </div>
            </div>
          </div>
        </article>
      </div>

      {!isPagedVideo ? <form className="conversation-composer" onSubmit={(event) => event.preventDefault()} aria-label="模拟聊天输入框">
        <div className="composer-box">
          <button className="composer-plus" type="button" aria-label="添加内容">＋</button>
          <textarea rows={1} aria-label="继续提问" placeholder="继续提问…" />
          <button className="composer-send" type="submit" aria-label="发送">↑</button>
        </div>
        <p>演示界面 · 当前回答来自图片复刻场景</p>
      </form> : null}
    </section>
  </main>;
}
