"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { splitGraphemes } from "@/lib/text/graphemes";
import { drawableGraphemes, findGraphemeRange, mergeRectsByLine, type RecreationMarkSegment } from "./recreation-geometry";
import { buildHandDrawnBoxPasses, buildHandDrawnStrokePasses, type HandDrawnPass } from "./hand-drawn-path";
import { characterTransform, resolveTextPlacement } from "./text-placement";
import type { RecreationBox, RecreationElement, RecreationMark, RecreationScene, RecreationStroke, RecreationText } from "./recreation-types";
import { isStaticElement } from "./recreation-types";
import "@/features/paper/font.css";
import "./recreation.css";

export interface RecreationCanvasProps {
  scene: RecreationScene;
  progress?: Record<string, number>;
  completed?: boolean;
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
  const jitter = element.style?.characterJitter ?? 0.66;
  return <div className="recreation-text" data-text-id={element.id} style={style} aria-label={element.text}>
    {element.text.split(/\r?\n/u).map((line, lineIndex) => <div className="recreation-line" key={`${element.id}:line:${lineIndex}`}>
      {splitGraphemes(line).map((unit) => {
        const index = graphemeIndex++;
        const visibleNow = index < visible;
        return <span className={classForUnit(unit)} data-grapheme-index={index} key={`${element.id}:${index}`} style={{ visibility: visibleNow ? "visible" : "hidden", transform: unit.trim() ? characterTransform(element.id, index, jitter) : undefined }} aria-hidden="true">{unit === " " ? "\u00a0" : unit}</span>;
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
    const maskId = `draw-mask-${pass.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const path = <path d={pass.path} fill={index === 0 && progress >= 1 ? (fill ?? "none") : "none"} stroke={color} strokeWidth={width * pass.widthScale} strokeOpacity={opacity * pass.opacity} strokeDasharray={dash ?? "1"} strokeDashoffset={dash ? undefined : 1 - value} pathLength={dash ? undefined : 1} strokeLinecap="round" strokeLinejoin="round" mask={dash ? `url(#${maskId})` : undefined} data-drawn-element={element.id} />;
    if (!dash) return <g key={pass.id}>{path}</g>;
    return <g key={pass.id}>
      <defs><mask id={maskId} maskUnits="userSpaceOnUse"><path d={pass.path} fill="none" stroke="white" strokeWidth={Math.max(6, width * 4)} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - value} strokeLinecap="round" strokeLinejoin="round" /></mask></defs>
      {path}
    </g>;
  })}</g>;
}

const strokePassCache = new WeakMap<object, HandDrawnPass[]>();
const boxPassCache = new WeakMap<object, HandDrawnPass[]>();
function strokePasses(element: RecreationStroke) { const cached = strokePassCache.get(element); if (cached) return cached; const passes = buildHandDrawnStrokePasses(element); strokePassCache.set(element, passes); return passes; }
function boxPasses(element: RecreationBox) { const cached = boxPassCache.get(element); if (cached) return cached; const passes = buildHandDrawnBoxPasses(element); boxPassCache.set(element, passes); return passes; }

function valueFor(element: RecreationElement, progress: Record<string, number> | undefined, completed: boolean) {
  if (completed || isStaticElement(element)) return 1;
  return progress?.[element.id] ?? 0;
}

function SvgElements({ scene, elements, progress, completed, markGeometry }: { scene: RecreationScene; elements: RecreationElement[]; progress?: Record<string, number>; completed: boolean; markGeometry: Record<string, RecreationMarkSegment[]> }) {
  return <svg className="recreation-ink" viewBox={`0 0 ${scene.width} ${scene.height}`} data-scene-viewbox={`0 0 ${scene.width} ${scene.height}`} aria-hidden="true">
    {elements.map((element) => {
      const value = valueFor(element, progress, completed);
      if (element.kind === "stroke") return <DrawnPasses key={element.id} element={element} passes={strokePasses(element)} progress={value} color={element.color ?? "#171717"} width={element.width ?? 1.4} opacity={element.opacity ?? 1} dash={element.dash} />;
      if (element.kind === "box") return <DrawnPasses key={element.id} element={element} passes={boxPasses(element)} progress={value} color={element.stroke ?? "#171717"} width={element.strokeWidth ?? 1.4} opacity={1} dash={element.dash} fill={element.fill} />;
      if (element.kind === "mark") return <MarkPaths key={element.id} mark={element} segments={markGeometry[element.id] ?? []} progress={value} />;
      return null;
    })}
  </svg>;
}

export function RecreationCanvas({ scene, progress, completed = false }: RecreationCanvasProps) {
  const paperRef = useRef<HTMLElement>(null);
  const [markGeometry, setMarkGeometry] = useState<Record<string, RecreationMarkSegment[]>>({});
  const elements = useMemo(() => scene.elements, [scene.elements]);

  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const paperRect = paper.getBoundingClientRect();
      if (!paperRect.width || !paperRect.height) return;
      const scaleX = paperRect.width / scene.width;
      const scaleY = paperRect.height / scene.height;
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
            const left = (rect.left - paperRect.left) / scaleX;
            const top = (rect.top - paperRect.top) / scaleY;
            const width = rect.width / scaleX;
            const height = rect.height / scaleY;
            return { left, top, right: left + width, bottom: top + height, width, height };
          });
        geometry[mark.id] = mergeRectsByLine(rects);
      }
      setMarkGeometry(geometry);
    };
    measure();
    if (typeof document !== "undefined" && "fonts" in document) void document.fonts.ready.then(measure, measure);
    return () => { cancelled = true; };
  }, [elements, scene.height, scene.width]);

  const paperStyle = {
    width: scene.width,
    height: scene.height,
    "--paper-bg": scene.paper.background,
    "--paper-pattern-color": scene.paper.patternColor,
    "--paper-spacing": `${scene.paper.spacing}px`,
    "--paper-pattern-offset": `${scene.paper.patternOffset ?? scene.paper.spacing}px`,
    "--paper-pattern-thickness": `${scene.paper.patternThickness ?? 1}px`,
  } as React.CSSProperties;

  return <article ref={paperRef} className={`recreation-paper recreation-paper--${scene.paper.pattern}`} style={paperStyle} data-scene-id={scene.id}>
    <SvgElements scene={scene} elements={elements} progress={progress} completed={completed} markGeometry={markGeometry} />
    {elements.filter((element): element is RecreationText => element.kind === "text").map((element) => <TextElement key={element.id} element={element} progress={valueFor(element, progress, completed)} scene={scene} />)}
  </article>;
}
