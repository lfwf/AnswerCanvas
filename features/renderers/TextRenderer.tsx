import type { ListLayoutElement, TextLayoutElement, TitleLayoutElement } from "@/features/layout/layout-types";
import { AnnotationLayer } from "./AnnotationLayer";
const revealStyle = (progress: number) => ({ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` });

export function TitleRenderer({ element, progress }: { element: TitleLayoutElement; progress: number }) {
  return <h2 className="note-title handwritten-element" data-target-id={`${element.id}:text`} style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)`, ...revealStyle(progress) }}>{element.payload.text}</h2>;
}
export function TextRenderer({ element, progress, targetProgress }: { element: TextLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  return <section className={`note-text handwritten-element ${element.kind === "callout" ? `callout callout-${element.payload.tone}` : ""}`} style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
    <div className="reveal-mask" data-target-id={`${element.id}:text`} style={revealStyle(progress)}>{element.payload.lines.map((line, index) => <div key={index}>{line || "\u00a0"}</div>)}</div>
    <AnnotationLayer element={element} progress={targetProgress} />
  </section>;
}
export function ListRenderer({ element, progress, targetProgress }: { element: ListLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  return <section className="note-list handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
    <div className="reveal-mask" data-target-id={`${element.id}:text`} style={revealStyle(progress)}>{element.payload.items.map((item) => <div className="note-list-item" key={item.id}><span>•</span><div>{item.lines.map((line, index) => <div key={index}>{line}</div>)}</div></div>)}</div>
    <AnnotationLayer element={element} progress={targetProgress} />
  </section>;
}
