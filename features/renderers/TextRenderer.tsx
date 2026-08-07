import { splitGraphemes } from "@/lib/text/graphemes";
import type { ListLayoutElement, TextLayoutElement, TitleLayoutElement } from "@/features/layout/layout-types";
import { AnnotationLayer } from "./AnnotationLayer";

const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));
const visibleCount = (length: number, progress: number) => Math.floor(length * clampProgress(progress));

function characterTransform(index: number) {
  const rotate = (((index * 37) % 11) - 5) * 0.13;
  const offsetY = (((index * 19) % 7) - 3) * 0.34;
  const scaleX = 1 + ((((index * 13) % 5) - 2) * 0.008);
  return `translateY(${offsetY}px) rotate(${rotate}deg) scaleX(${scaleX})`;
}

function GraphemeText({ text, visible, offset = 0 }: { text: string; visible: number; offset?: number }) {
  const graphemes = splitGraphemes(text);
  return <>{graphemes.slice(0, Math.max(0, visible)).map((grapheme, index) => (
    <span className={`handwritten-char${/[A-Za-z0-9]/u.test(grapheme) ? " latin-handwritten" : ""}`} key={`${offset + index}-${grapheme}`} style={{ transform: characterTransform(offset + index) }}>
      {grapheme === " " ? "\u00a0" : grapheme}
    </span>
  ))}</>;
}

function HandwrittenLines({ lines, progress }: { lines: string[]; progress: number }) {
  const graphemeLines = lines.map(splitGraphemes);
  const lengths = graphemeLines.map((line) => line.length);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const revealed = visibleCount(total, progress);
  const offsets = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0));
  return <>{lines.map((line, index) => {
    const length = lengths[index];
    const start = offsets[index];
    const lineVisible = Math.min(length, Math.max(0, revealed - start));
    return <div className="handwritten-line" key={index}><GraphemeText text={line} visible={lineVisible} offset={start} />{lineVisible === 0 ? "\u00a0" : null}</div>;
  })}</>;
}
export function revealText(text: string, progress: number): string {
  const graphemes = splitGraphemes(text);
  return graphemes.slice(0, visibleCount(graphemes.length, progress)).join("");
}

export function TitleRenderer({ element, progress }: { element: TitleLayoutElement; progress: number }) {
  const graphemes = splitGraphemes(element.payload.text);
  return (
    <h2
      className="note-title handwritten-element"
      data-target-id={`${element.id}:text`}
      style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}
    >
      <GraphemeText text={element.payload.text} visible={visibleCount(graphemes.length, progress)} />
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
  const lineLengths = element.payload.items.map((item) => item.lines.map((line) => splitGraphemes(line).length));
  const itemLengths = lineLengths.map((lengths) => lengths.reduce((sum, length) => sum + length, 0));
  const total = itemLengths.reduce((sum, length) => sum + length, 0);
  const revealed = visibleCount(total, progress);
  const itemOffsets = itemLengths.map((_, index) => itemLengths.slice(0, index).reduce((sum, length) => sum + length, 0));
  return (
    <section className="note-list handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, transform: `rotate(${element.jitter.rotate}deg) translateY(${element.jitter.offsetY}px)` }}>
      <div className="reveal-mask" data-target-id={`${element.id}:text`}>
        {element.payload.items.map((item, itemIndex) => {
          const itemStart = itemOffsets[itemIndex];
          const renderedLines = item.lines.map((line, lineIndex) => {
            const length = lineLengths[itemIndex][lineIndex];
            const start = itemStart + lineLengths[itemIndex].slice(0, lineIndex).reduce((sum, current) => sum + current, 0);
            const lineVisible = Math.min(length, Math.max(0, revealed - start));
            return <div className="handwritten-line" key={`${item.id}-${lineIndex}`}><GraphemeText text={line} visible={lineVisible} offset={start} />{lineVisible === 0 ? "\u00a0" : null}</div>;
          });
          const started = revealed > itemStart;
          return <div className="note-list-item" key={item.id}><span>{started ? "•" : ""}</span><div>{renderedLines}</div></div>;
        })}
      </div>
      <AnnotationLayer element={element} progress={targetProgress} />
    </section>
  );
}