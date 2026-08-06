import type { ListLayoutElement, TextLayoutElement, TitleLayoutElement } from "@/features/layout/layout-types";
import { countGraphemes } from "@/lib/text/graphemes";
import { AnnotationLayer } from "./AnnotationLayer";

const revealStyle = (progress: number) => ({ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` });

function sequentialProgress(lines: string[], progress: number) {
  const lengths = lines.map((line) => Math.max(1, countGraphemes(line)));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let cursor = 0;
  return lengths.map((length) => {
    const start = cursor / total;
    cursor += length;
    const end = cursor / total;
    return Math.min(1, Math.max(0, (progress - start) / Math.max(0.0001, end - start)));
  });
}

export function TitleRenderer({ element, progress }: { element: TitleLayoutElement; progress: number }) {
  return <h2 className="note-title handwritten-element" data-target-id={`${element.id}:text`} style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)`, ...revealStyle(progress) }}>{element.payload.text}</h2>;
}

export function TextRenderer({ element, progress, targetProgress }: { element: TextLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  const lineProgress = sequentialProgress(element.payload.lines, progress);
  return <section className={`note-text handwritten-element ${element.kind === "callout" ? `callout callout-${element.payload.tone}` : ""}`} style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
    <div className="reveal-mask" data-target-id={`${element.id}:text`}>{element.payload.lines.map((line, index) => <div className="reveal-line" key={index} style={revealStyle(lineProgress[index])}>{line || "\u00a0"}</div>)}</div>
    <AnnotationLayer element={element} progress={targetProgress} />
  </section>;
}

export function ListRenderer({ element, progress, targetProgress }: { element: ListLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  const allLines = element.payload.items.flatMap((item) => item.lines);
  const lineProgress = sequentialProgress(allLines, progress);
  let lineIndex = 0;
  return <section className="note-list handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
    <div className="reveal-mask" data-target-id={`${element.id}:text`}>{element.payload.items.map((item) => <div className="note-list-item" key={item.id}><span>•</span><div>{item.lines.map((line) => { const current = lineIndex++; return <div className="reveal-line" key={`${item.id}-${current}`} style={revealStyle(lineProgress[current])}>{line}</div>; })}</div></div>)}</div>
    <AnnotationLayer element={element} progress={targetProgress} />
  </section>;
}
