"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { splitGraphemes } from "@/lib/text/graphemes";
import { RecreationPlayer, type RecreationEvent } from "./recreation-player";
import { drawableGraphemes, findGraphemeRange, mergeRectsByLine, type RecreationMarkSegment } from "./recreation-geometry";
import { buildHandDrawnBoxPasses, buildHandDrawnStrokePasses, type HandDrawnPass } from "./hand-drawn-path";
import { characterTransform, resolveTextPlacement } from "./text-placement";
import type { RecreationBox, RecreationElement, RecreationMark, RecreationScene, RecreationStroke, RecreationText } from "./recreation-types";
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

function unitsFor(element: RecreationElement) {
  if (element.kind === "text") return drawableGraphemes(element.text).length;
  if (element.kind === "mark") return Math.max(1, drawableGraphemes(element.match).length);
  return 1;
}

function durationFor(element: RecreationElement) {
  if (element.kind === "text") return Math.max(260, unitsFor(element) * 58);
  if (element.kind === "mark") return Math.max(300, unitsFor(element) * 32);
  if (element.kind === "box") return element.handDrawn === false ? 620 : 1180;
  return element.handDrawn === false ? 520 : 760;
}

function classForUnit(unit: string) {
  return /[A-Za-z0-9]/u.test(unit) ? "recreation-char latin-handwritten" : "recreation-char";
}

function TextElement({ element, progress, scene }: { element: RecreationText; progress: number; scene: RecreationScene }) {
  const total = drawableGraphemes(element.text).length;
  const visible = Math.floor(total * Math.min(1, Math.max(0, progress)));
  const placement = resolveTextPlacement(element, scene.paper);
  let graphemeIndex = 0;
  const style = {
    left: placement.left,
    top: placement.top,
    width: element.width,
    height: element.height,
    color: element.style?.color,
    fontSize: element.style?.fontSize,
    lineHeight: placement.lineHeight ? `${placement.lineHeight}px` : element.style?.lineHeight ? `${element.style.lineHeight}px` : undefined,
    fontWeight: element.style?.fontWeight,
    textAlign: element.style?.textAlign,
    letterSpacing: element.style?.letterSpacing,
    transform: element.style?.rotate ? `rotate(${element.style.rotate}deg)` : undefined,
  } as React.CSSProperties;
  const jitter = element.style?.characterJitter ?? 0.72;
  return <div className="recreation-text" data-text-id={element.id} style={style} aria-label={element.text}>
    {element.text.split(/\r?\n/u).map((line, lineIndex) => <div className="recreation-line" key={`${element.id}:line:${lineIndex}`}>
      {splitGraphemes(line).map((unit) => {
        const index = graphemeIndex++;
        const isVisible = index < visible;
        return <span className={classForUnit(unit)} data-grapheme-index={index} key={`${element.id}:${index}`} style={{ visibility: isVisible ? "visible" : "hidden", transform: unit.trim() ? characterTransform(element.id, index, jitter) : undefined }} aria-hidden="true">{unit === " " ? "\u00a0" : unit}</span>;
      })}
      {!line && <span aria-hidden="true">\u00a0</span>}
    </div>)}
  </div>;
}

function segmentProgress(progress: number, index: number, count: number) {
  return Math.min(1, Math.max(0, progress * count - index));
}

function MarkPaths({ mark, segments, progress }: { mark: RecreationMark; segments: RecreationMarkSegment[]; progress: number }) {
  const padding = mark.padding ?? 3;
  const wobble = mark.wobble ?? 1.5;
  const color = mark.color ?? (mark.mark === "highlight" ? "rgba(245,202,73,.48)" : "#c62727");
  return <>{segments.map((segment, index) => {
    const value = segmentProgress(progress, index, segments.length);
    const x1 = segment.x - padding;
    const x2 = segment.x + segment.width + padding;
    const centerY = segment.y + segment.height * 0.53;
    if (mark.mark === "circle") {
      return <ellipse key={`${mark.id}:${index}`} cx={segment.x + segment.width / 2} cy={segment.y + segment.height / 2} rx={segment.width / 2 + padding * 2} ry={segment.height / 2 + padding} fill="none" stroke={color} strokeWidth={mark.width ?? 1.8} strokeOpacity={(mark.opacity ?? 1) * value} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - value} strokeLinecap="round" />;
    }
    const y = mark.mark === "underline" ? segment.y + segment.height + (mark.offset ?? 1) : centerY + (mark.offset ?? 0);
    return <path key={`${mark.id}:${index}`} d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + (index % 2 ? -wobble : wobble)} ${x2} ${y}`} fill="none" stroke={color} strokeWidth={mark.width ?? (mark.mark === "highlight" ? Math.max(8, segment.height * .55) : 1.8)} strokeOpacity={(mark.opacity ?? 1) * value} strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - value} />;
  })}</>;
}

function DrawnPasses({ element, passes, progress, color, width, opacity, dash, fill }: { element: RecreationStroke | RecreationBox; passes: HandDrawnPass[]; progress: number; color: string; width: number; opacity: number; dash?: string; fill?: string }) {
  return <g>{passes.map((pass, index) => {
    const value = segmentProgress(progress, index, passes.length);
    const canRevealByLength = !dash;
    return <path key={pass.id} d={pass.path} fill={index === 0 && progress >= 1 ? (fill ?? "none") : "none"} stroke={color} strokeWidth={width * pass.widthScale} strokeOpacity={opacity * pass.opacity * (canRevealByLength ? 1 : value)} strokeDasharray={dash ?? "1"} strokeDashoffset={canRevealByLength ? 1 - value : undefined} pathLength={canRevealByLength ? 1 : undefined} strokeLinecap="round" strokeLinejoin="round" data-drawn-element={element.id} />;
  })}</g>;
}

const strokePassCache = new WeakMap<RecreationStroke, HandDrawnPass[]>();
const boxPassCache = new WeakMap<RecreationBox, HandDrawnPass[]>();
function strokePasses(element: RecreationStroke) { const cached = strokePassCache.get(element); if (cached) return cached; const passes = buildHandDrawnStrokePasses(element); strokePassCache.set(element, passes); return passes; }
function boxPasses(element: RecreationBox) { const cached = boxPassCache.get(element); if (cached) return cached; const passes = buildHandDrawnBoxPasses(element); boxPassCache.set(element, passes); return passes; }

function SvgElements({ scene, elements, progress, markGeometry }: { scene: RecreationScene; elements: RecreationElement[]; progress: Record<string, number>; markGeometry: Record<string, RecreationMarkSegment[]> }) {
  return <svg className="recreation-ink" viewBox={`0 0 ${scene.width} ${scene.height}`} aria-hidden="true">
    {elements.map((element) => {
      const value = progress[element.id] ?? 0;
      if (element.kind === "stroke") return <DrawnPasses key={element.id} element={element} passes={strokePasses(element)} progress={value} color={element.color ?? "#171717"} width={element.width ?? 1.4} opacity={element.opacity ?? 1} dash={element.dash} />;
      if (element.kind === "box") return <DrawnPasses key={element.id} element={element} passes={boxPasses(element)} progress={value} color={element.stroke ?? "#171717"} width={element.strokeWidth ?? 1.4} opacity={1} dash={element.dash} fill={element.fill} />;
      if (element.kind === "mark") return <MarkPaths key={element.id} mark={element} segments={markGeometry[element.id] ?? []} progress={value} />;
      return null;
    })}
  </svg>;
}

export function RecreationStage({ scene }: { scene: RecreationScene }) {
  const reducedMotion = useReducedMotion();
  const fontsReady = useFontsReady();
  const viewportRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const playerRef = useRef<RecreationPlayer | null>(null);
  const speedRef = useRef(1);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [markGeometry, setMarkGeometry] = useState<Record<string, RecreationMarkSegment[]>>({});
  const [scale, setScale] = useState(0.7);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "complete">("idle");
  const [speed, setSpeed] = useState(1);
  const elements = useMemo(() => [...scene.elements].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)), [scene.elements]);
  const events = useMemo<RecreationEvent[]>(() => elements.map((element) => ({ id: element.id, durationMs: durationFor(element) })), [elements]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, Math.max(0.32, (entry.contentRect.width - 36) / scene.width))));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scene.width]);

  useLayoutEffect(() => {
    if (!fontsReady) return;
    const paper = paperRef.current;
    if (!paper) return;
    const frame = requestAnimationFrame(() => {
      const paperRect = paper.getBoundingClientRect();
      const geometry: Record<string, RecreationMarkSegment[]> = {};
      const textElements = new Map(elements.filter((element): element is RecreationText => element.kind === "text").map((element) => [element.id, element]));
      for (const mark of elements.filter((element): element is RecreationMark => element.kind === "mark")) {
        const textElement = textElements.get(mark.targetId);
        const range = textElement ? findGraphemeRange(textElement.text, mark.match, mark.occurrence) : null;
        const target = Array.from(paper.querySelectorAll<HTMLElement>("[data-text-id]")).find((node) => node.dataset.textId === mark.targetId);
        if (!target || !range) { geometry[mark.id] = []; continue; }
        const rects = Array.from(target.querySelectorAll<HTMLElement>("[data-grapheme-index]"))
          .filter((node) => { const index = Number(node.dataset.graphemeIndex); return index >= range.start && index <= range.end; })
          .map((node) => {
            const rect = node.getBoundingClientRect();
            const left = (rect.left - paperRect.left) / scale;
            const top = (rect.top - paperRect.top) / scale;
            const width = rect.width / scale;
            const height = rect.height / scale;
            return { left, top, right: left + width, bottom: top + height, width, height };
          });
        geometry[mark.id] = mergeRectsByLine(rects);
      }
      setMarkGeometry(geometry);
    });
    return () => cancelAnimationFrame(frame);
  }, [elements, fontsReady, scale]);

  useEffect(() => {
    if (!fontsReady) return;
    const player = new RecreationPlayer({
      events,
      onProgress: (event, value) => setProgress((current) => ({ ...current, [event.id]: value })),
      onComplete: () => setStatus("complete"),
    });
    player.setSpeed(speedRef.current);
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
  }, [events, fontsReady, reducedMotion]);

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

  const changeSpeed = useCallback((next: number) => { speedRef.current = next; setSpeed(next); playerRef.current?.setSpeed(next); }, []);
  const paperStyle = {
    width: scene.width,
    height: scene.height,
    transform: `scale(${scale})`,
    "--paper-bg": scene.paper?.background ?? "#faf9ee",
    "--rule-color": scene.paper?.ruleColor ?? "rgba(84,113,139,.16)",
    "--rule-spacing": `${scene.paper?.ruleSpacing ?? 31}px`,
    "--rule-thickness": `${scene.paper?.ruleThickness ?? 1}px`,
    "--rule-offset": `${scene.paper?.ruleOffset ?? 30}px`,
  } as React.CSSProperties;

  return <main className="recreation-shell">
    <header className="recreation-brand" aria-label="AnswerCanvas"><div className="brand-mark">AC</div><div><h1>AnswerCanvas</h1><p>Codex image recreation</p></div></header>
    <aside className="recreation-handoff"><strong>图片转手写</strong><span>把图片发给 Codex，说“转成手写”，它会更新当前复刻场景。</span><small>{scene.sourceName}</small></aside>
    <section className="recreation-viewport" ref={viewportRef} aria-label="手写复刻画布">
      <div className="recreation-paper-shell" style={{ width: scene.width * scale, height: scene.height * scale }}>
        <article ref={paperRef} className="recreation-paper" style={paperStyle}>
          <SvgElements scene={scene} elements={elements} progress={progress} markGeometry={markGeometry} />
          {elements.filter((element): element is RecreationText => element.kind === "text").map((element) => <TextElement key={element.id} element={element} progress={progress[element.id] ?? 0} scene={scene} />)}
        </article>
      </div>
    </section>
    <div className="recreation-status">{!fontsReady ? "正在加载字体" : status === "complete" ? "已完成" : status === "paused" ? "已暂停" : status === "playing" ? "正在书写" : "准备开始"}</div>
    <nav className="recreation-toolbar" aria-label="播放控制"><button type="button" onClick={togglePlay} disabled={status === "complete" || !fontsReady}>{status === "playing" ? "暂停" : "继续"}</button><button type="button" onClick={replay} disabled={!fontsReady}>重播</button><select aria-label="播放速度" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></nav>
  </main>;
}
