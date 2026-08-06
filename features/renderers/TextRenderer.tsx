import { splitGraphemes } from "@/lib/text/graphemes";
import type { ListLayoutElement, TextLayoutElement, TitleLayoutElement } from "@/features/layout/layout-types";
import { AnnotationLayer } from "./AnnotationLayer";

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

export function revealText(text: string, progress: number): string {
  const graphemes = splitGraphemes(text);
  return graphemes.slice(0, Math.floor(graphemes.length * clampProgress(progress))).join("");
}

function revealLines(lines: string[], progress: number): string[] {
  const graphemeLines = lines.map(splitGraphemes);
  const total = graphemeLines.reduce((sum, line) => sum + line.length, 0);
  let remaining = Math.floor(total * clampProgress(progress));
  return graphemeLines.map((line) => {
    const visible = line.slice(0, Math.max(0, remaining)).join("");
    remaining -= line.length;
    return visible;
  });
}

function HandwrittenLines({ lines, progress }: { lines: string[]; progress: number }) {
  const visibleLines = revealLines(lines, progress);
  return <>{visibleLines.map((line, index) => <div key={index}>{line || "\u00a0"}</div>)}</>;
}

export function TitleRenderer({ element, progress }: { element: TitleLayoutElement; progress: number }) {
  return (
    <h2
      className="note-title handwritten-element"
      data-target-id={`${element.id}:text`}
      style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}
    >
      {revealText(element.payload.text, progress)}
    </h2>
  );
}

export function TextRenderer({ element, progress, targetProgress }: { element: TextLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  return (
    <section className={`note-text handwritten-element ${element.kind === "callout" ? `callout callout-${element.payload.tone}` : ""}`} style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
      <div className="reveal-mask" data-target-id={`${element.id}:text`}><HandwrittenLines lines={element.payload.lines} progress={progress} /></div>
      <AnnotationLayer element={element} progress={targetProgress} />
    </section>
  );
}

export function ListRenderer({ element, progress, targetProgress }: { element: ListLayoutElement; progress: number; targetProgress: Record<string, number> }) {
  const allLines = element.payload.items.flatMap((item) => item.lines);
  const visibleLines = revealLines(allLines, progress);
  let lineCursor = 0;
  return (
    <section className="note-list handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
      <div className="reveal-mask" data-target-id={`${element.id}:text`}>
        {element.payload.items.map((item) => {
          const lines = visibleLines.slice(lineCursor, lineCursor + item.lines.length);
          lineCursor += item.lines.length;
          const started = lines.some(Boolean);
          return <div className="note-list-item" key={item.id}><span>{started ? "•" : ""}</span><div>{lines.map((line, index) => <div key={index}>{line || "\u00a0"}</div>)}</div></div>;
        })}
      </div>
      <AnnotationLayer element={element} progress={targetProgress} />
    </section>
  );
}
