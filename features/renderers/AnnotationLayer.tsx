import { splitGraphemes } from "@/lib/text/graphemes";
import { createCanvasTextMeasurer } from "@/features/layout/text-measurer";
import type { ArrowLayoutElement, ListLayoutElement, TextLayoutElement } from "@/features/layout/layout-types";
import { roughEllipsePath, roughLinePath } from "./rough-strokes";

interface AnnotationRect { x: number; y: number; width: number; height: number; }
interface LineRecord { text: string; start: number; y: number; }

const ANNOTATION_FONT_SIZE = 27.5;
const ANNOTATION_LINE_HEIGHT = 42;

function lineRecords(element: TextLayoutElement | ListLayoutElement): LineRecord[] {
  const records: LineRecord[] = [];
  let start = 0;
  let y = 29;
  const addLine = (text: string) => {
    records.push({ text, start, y });
    start += splitGraphemes(text).length;
    y += ANNOTATION_LINE_HEIGHT;
  };

  if (element.kind === "bullet-list") {
    element.payload.items.forEach((item) => {
      item.lines.forEach(addLine);
      y += 10;
    });
  } else {
    element.payload.lines.forEach(addLine);
  }
  return records;
}

function annotationGeometry(element: TextLayoutElement | ListLayoutElement, spanId: string): AnnotationRect[] {
  const spans = element.kind === "bullet-list"
    ? element.payload.items.flatMap((item) => item.spans)
    : element.payload.spans;
  const targetIndex = spans.findIndex((span) => span.id === spanId);
  const target = spans[targetIndex];
  const leftInset = element.kind === "bullet-list" ? 42 : element.kind === "callout" ? 28 : 2;
  if (!target) return [{ x: leftInset, y: 29, width: Math.max(46, element.box.width * 0.45), height: 30 }];

  const targetStart = spans.slice(0, targetIndex).reduce((sum, span) => sum + splitGraphemes(span.text).length, 0);
  const targetEnd = targetStart + splitGraphemes(target.text).length;
  const measure = createCanvasTextMeasurer();
  const rects = lineRecords(element).flatMap((line) => {
    const lineGraphemes = splitGraphemes(line.text);
    const lineEnd = line.start + lineGraphemes.length;
    const overlapStart = Math.max(targetStart, line.start);
    const overlapEnd = Math.min(targetEnd, lineEnd);
    if (overlapStart >= overlapEnd) return [];
    const prefix = lineGraphemes.slice(0, overlapStart - line.start).join("");
    const content = lineGraphemes.slice(overlapStart - line.start, overlapEnd - line.start).join("");
    const x = leftInset + measure.measure(prefix, ANNOTATION_FONT_SIZE);
    const width = Math.max(8, measure.measure(content, ANNOTATION_FONT_SIZE));
    return [{ x, y: line.y, width, height: 30 }];
  });
  return rects.length ? rects : [{ x: leftInset, y: 29, width: Math.max(46, element.box.width * 0.45), height: 30 }];
}

export function AnnotationLayer({ element, progress }: { element: TextLayoutElement | ListLayoutElement; progress: Record<string, number> }) {
  const annotations = element.payload.annotations;
  if (!annotations.length) return null;
  return (
    <svg className="annotation-layer" viewBox={`0 0 ${element.box.width} ${element.box.height}`} aria-hidden="true">
      {annotations.flatMap((annotation, index) => {
        const value = progress[`${element.id}:annotation:${annotation.id}`] ?? 0;
        return annotationGeometry(element, annotation.target.spanId).flatMap((geometry, rectIndex) => {
          const wobble = (index + rectIndex) % 2 ? 2.4 : -2.4;
          if (annotation.type === "highlight") {
            return <path key={`${annotation.id}:${rectIndex}`} className="annotation-highlight" d={roughLinePath({ x: geometry.x, y: geometry.y }, { x: geometry.x + geometry.width, y: geometry.y + 1 }, `${element.id}:${annotation.id}:${rectIndex}`, { segments: 8, wobble: 2.8, bow: wobble })} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
          }
          if (annotation.type === "circle") {
            const cx = geometry.x + geometry.width / 2;
            const cy = geometry.y - 9;
            return <g key={`${annotation.id}:${rectIndex}`}>
              <path className="annotation-blue" d={roughEllipsePath(cx, cy, geometry.width / 2 + 10, geometry.height / 2 + 4, `${element.id}:${annotation.id}:${rectIndex}:outer`, -0.04, 3.2)} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
              <path className="annotation-blue" opacity="0.24" d={roughEllipsePath(cx + 1.5, cy - 1, geometry.width / 2 + 8, geometry.height / 2 + 3, `${element.id}:${annotation.id}:${rectIndex}:echo`, 0.02, 2.4)} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
            </g>;
          }
          const lineY = annotation.type === "strike" ? geometry.y - 10 : geometry.y + 8;
          return <path key={`${annotation.id}:${rectIndex}`} className={annotation.type === "strike" ? "annotation-red" : "annotation-blue"} d={roughLinePath({ x: geometry.x - 2, y: lineY }, { x: geometry.x + geometry.width + 4, y: lineY }, `${element.id}:${annotation.id}:${rectIndex}`, { segments: 7, wobble: 2.1, bow: wobble })} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
        });
      })}
    </svg>
  );
}

export function ArrowRenderer({ element, progress }: { element: ArrowLayoutElement; progress: number }) {
  const { fromPoint, toPoint } = element.payload;
  return (
    <svg className="document-arrow" viewBox="0 0 794 1123" aria-hidden="true">
      <defs>
        <marker id={`head-${element.id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="currentColor" />
        </marker>
      </defs>
      <path d={roughLinePath(fromPoint, toPoint, element.id, { segments: 10, wobble: 2.2, bow: -24 })} pathLength="1" markerEnd={`url(#head-${element.id})`} style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }} />
    </svg>
  );
}
