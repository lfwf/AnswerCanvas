"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { splitGraphemes } from "@/lib/text/graphemes";
import { drawableGraphemes, findGraphemeRange, mergeRectsByLine, type RecreationMarkSegment } from "./recreation-geometry";
import { buildHandDrawnBoxPasses, buildHandDrawnStrokePasses, type HandDrawnPass } from "./hand-drawn-path";
import { presentationOpacityFor } from "./recreation-presentation";
import { characterTransform, resolveTextPlacement } from "./text-placement";
import type { RecreationAnnotation, RecreationBox, RecreationElement, RecreationMark, RecreationScene, RecreationStroke, RecreationText } from "./recreation-types";
import { isStaticElement } from "./recreation-types";
import "@/features/paper/font.css";
import "./recreation.css";

export interface RecreationCanvasProps {
  scene: RecreationScene;
  progress?: Record<string, number>;
  completed?: boolean;
  pageId?: string;
}

interface AnnotationAnchor { x: number; y: number; width: number; height: number; }

const CJK_HANDWRITING_STACK = '"Kaiti SC", "STKaiti", "KaiTi", "DFKai-SB", "AnswerCanvasHandwriting", cursive';

function classForUnit(unit: string) {
  if (/[0-9]/u.test(unit)) return "recreation-char numeric-handwritten";
  if (/[A-Za-z]/u.test(unit)) return "recreation-char latin-handwritten";
  return "recreation-char";
}

function containsCjk(value: string) {
  return /[\p{Script=Han}\u3000-\u303f\uff00-\uffef]/u.test(value);
}

function approximateUnitWidth(unit: string) {
  if (!unit.trim()) return .34;
  if (/^[A-Za-z0-9]$/u.test(unit)) return .58;
  if (/^[%+\-～~”"'/:·.,，。()（）\[\]]$/u.test(unit)) return .5;
  return 1;
}

function fitScaleForText(value: string, width: number, fontSize: number) {
  const availableWidth = Math.max(24, width - 14);
  const longest = value.split(/\r?\n/u).reduce((max, line) => {
    const units = splitGraphemes(line).reduce((sum, unit) => sum + approximateUnitWidth(unit), 0);
    return Math.max(max, units * fontSize);
  }, 0);
  if (!longest || longest <= availableWidth) return 1;
  return Math.max(.76, Math.min(1, availableWidth / longest));
}

function TextElement({ element, progress, scene, opacity }: { element: RecreationText; progress: number; scene: RecreationScene; opacity: number }) {
  const total = drawableGraphemes(element.text).length;
  const visible = Math.floor(total * Math.min(1, Math.max(0, progress)));
  const placement = resolveTextPlacement(element, scene.paper);
  const isPagedVideo = Boolean(scene.pages?.length);
  const fontScale = isPagedVideo ? 1.18 : 1;
  const lineScale = isPagedVideo ? 1.05 : 1;
  const baseFontSize = element.style?.fontSize ? element.style.fontSize * fontScale : undefined;
  const fitScale = isPagedVideo && baseFontSize ? fitScaleForText(element.text, element.width, baseFontSize) : 1;
  const resolvedLineHeight = placement.lineHeight ?? element.style?.lineHeight;
  const cjkRun = containsCjk(element.text);
  let graphemeIndex = 0;
  const style = {
    left: placement.left,
    top: placement.top,
    width: element.width,
    height: element.height,
    color: element.style?.color,
    fontFamily: cjkRun ? CJK_HANDWRITING_STACK : undefined,
    fontSize: baseFontSize ? baseFontSize * fitScale : undefined,
    lineHeight: resolvedLineHeight ? `${resolvedLineHeight * lineScale * fitScale}px` : undefined,
    fontWeight: cjkRun ? 400 : element.style?.fontWeight,
    fontSynthesis: cjkRun ? "none" : undefined,
    textAlign: element.style?.textAlign,
    letterSpacing: element.style?.letterSpacing,
    transform: element.style?.rotate ? `rotate(${element.style.rotate}deg)` : undefined,
    opacity,
  } as React.CSSProperties;
  const jitter = element.style?.characterJitter ?? (isPagedVideo ? 0.14 : 0.66);
  return <div className="recreation-text" data-text-id={element.id} data-fit-scale={fitScale.toFixed(3)} data-font-role={cjkRun ? "cjk-unified" : "default"} style={style} aria-label={element.text}>
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

function AnnotationElement({ element, progress, anchor, opacity }: { element: RecreationAnnotation; progress: number; anchor?: AnnotationAnchor; opacity: number }) {
  const units = splitGraphemes(element.label);
  const visible = Math.floor(units.length * Math.min(1, Math.max(0, progress)));
  const fontSize = element.fontSize ?? 15;
  const width = element.width ?? Math.max(92, Math.min(260, units.length * fontSize * 0.78));
  const position = element.position ?? "above";
  const left = anchor ? anchor.x + anchor.width / 2 - width / 2 + (element.offsetX ?? 0) : 0;
  const top = anchor ? (position === "above" ? anchor.y - fontSize * 1.65 : anchor.y + anchor.height + 8) + (element.offsetY ?? 0) : 0;
  const cjkRun = containsCjk(element.label);
  const jitter = element.characterJitter ?? 0.16;
  return <div className="recreation-annotation" data-annotation-id={element.id} aria-label={element.label} style={{ left, top, width, color: element.color ?? "#244f9d", fontFamily: cjkRun ? CJK_HANDWRITING_STACK : undefined, fontWeight: cjkRun ? 400 : undefined, fontSynthesis: cjkRun ? "none" : undefined, fontSize, opacity: anchor ? opacity : 0 }}>
    {units.map((unit, index) => <span className={classForUnit(unit)} key={`${element.id}:${index}`} style={{ visibility: index < visible ? "visible" : "hidden", transform: unit.trim() ? characterTransform(element.id, index, jitter) : undefined }} aria-hidden="true">{unit === " " ? "\u00a0" : unit}</span>)}
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
      const opacity = presentationOpacityFor(element, scene, progress, completed);
      if (element.kind === "stroke") return <g key={element.id} opacity={opacity}><DrawnPasses element={element} passes={strokePasses(element)} progress={value} color={element.color ?? "#171717"} width={element.width ?? 1.4} opacity={element.opacity ?? 1} dash={element.dash} /></g>;
      if (element.kind === "box") return <g key={element.id} opacity={opacity}><DrawnPasses element={element} passes={boxPasses(element)} progress={value} color={element.stroke ?? "#171717"} width={element.strokeWidth ?? 1.4} opacity={1} dash={element.dash} fill={element.fill} /></g>;
      if (element.kind === "mark") return <g key={element.id} opacity={opacity}><MarkPaths mark={element} segments={markGeometry[element.id] ?? []} progress={value} /></g>;
      return null;
    })}
  </svg>;
}

export function RecreationCanvas({ scene, progress, completed = false, pageId }: RecreationCanvasProps) {
  const paperRef = useRef<HTMLElement>(null);
  const [markGeometry, setMarkGeometry] = useState<Record<string, RecreationMarkSegment[]>>({});
  const [annotationGeometry, setAnnotationGeometry] = useState<Record<string, AnnotationAnchor>>({});
  const resolvedPageId = pageId ?? scene.pages?.[0]?.id;
  const isPagedVideo = Boolean(scene.pages?.length);
  const elements = useMemo(() => scene.elements.filter((element) => element.kind !== "page" && (!resolvedPageId || !element.pageId || element.pageId === resolvedPageId)), [resolvedPageId, scene.elements]);

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
      const marks: Record<string, RecreationMarkSegment[]> = {};
      const annotations: Record<string, AnnotationAnchor> = {};
      const textElements = new Map(elements.filter((element): element is RecreationText => element.kind === "text").map((element) => [element.id, element]));
      const nodes = new Map(Array.from(paper.querySelectorAll<HTMLElement>("[data-text-id]")).map((node) => [node.dataset.textId ?? "", node]));
      const rectsFor = (targetId: string, match: string, occurrence?: number) => {
        const textElement = textElements.get(targetId);
        const range = textElement ? findGraphemeRange(textElement.text, match, occurrence) : null;
        const target = nodes.get(targetId);
        if (!target || !range) return [];
        return Array.from(target.querySelectorAll<HTMLElement>("[data-grapheme-index]"))
          .filter((node) => { const index = Number(node.dataset.graphemeIndex); return index >= range.start && index <= range.end; })
          .map((node) => {
            const rect = node.getBoundingClientRect();
            const left = (rect.left - paperRect.left) / scaleX;
            const top = (rect.top - paperRect.top) / scaleY;
            const width = rect.width / scaleX;
            const height = rect.height / scaleY;
            return { left, top, right: left + width, bottom: top + height, width, height };
          });
      };
      for (const mark of elements.filter((element): element is RecreationMark => element.kind === "mark")) marks[mark.id] = mergeRectsByLine(rectsFor(mark.targetId, mark.match, mark.occurrence));
      for (const annotation of elements.filter((element): element is RecreationAnnotation => element.kind === "annotation")) {
        const segments = mergeRectsByLine(rectsFor(annotation.targetId, annotation.match, annotation.occurrence));
        if (!segments.length) continue;
        const left = Math.min(...segments.map((segment) => segment.x));
        const top = Math.min(...segments.map((segment) => segment.y));
        const right = Math.max(...segments.map((segment) => segment.x + segment.width));
        const bottom = Math.max(...segments.map((segment) => segment.y + segment.height));
        annotations[annotation.id] = { x: left, y: top, width: right - left, height: bottom - top };
      }
      setMarkGeometry(marks);
      setAnnotationGeometry(annotations);
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
    ...(isPagedVideo ? {
      backgroundColor: scene.paper.background,
      backgroundImage: "radial-gradient(ellipse at center, rgba(255,255,255,.2) 0 52%, rgba(113,83,48,.065) 100%), repeating-linear-gradient(8deg, rgba(92,65,38,.022) 0 1px, transparent 1px 6px), repeating-linear-gradient(96deg, rgba(119,88,51,.018) 0 1px, transparent 1px 11px), radial-gradient(circle at 21% 17%, rgba(103,76,46,.075) 0 .65px, transparent .9px), radial-gradient(circle at 72% 64%, rgba(126,94,55,.06) 0 .55px, transparent .85px)",
      backgroundSize: "100% 100%, 9px 9px, 15px 15px, 23px 19px, 29px 31px",
      backgroundBlendMode: "multiply, normal, normal, multiply, multiply",
    } : {}),
  } as React.CSSProperties;

  return <article ref={paperRef} className={`recreation-paper recreation-paper--${scene.paper.pattern}`} style={paperStyle} data-scene-id={scene.id} data-page-id={resolvedPageId}>
    <SvgElements scene={scene} elements={elements} progress={progress} completed={completed} markGeometry={markGeometry} />
    {elements.filter((element): element is RecreationText => element.kind === "text").map((element) => <TextElement key={element.id} element={element} progress={valueFor(element, progress, completed)} opacity={presentationOpacityFor(element, scene, progress, completed)} scene={scene} />)}
    {elements.filter((element): element is RecreationAnnotation => element.kind === "annotation").map((element) => <AnnotationElement key={element.id} element={element} progress={valueFor(element, progress, completed)} anchor={annotationGeometry[element.id]} opacity={presentationOpacityFor(element, scene, progress, completed)} />)}
  </article>;
}