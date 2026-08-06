import { countGraphemes } from "@/lib/text/graphemes";
import type { ArrowLayoutElement, ListLayoutElement, TextLayoutElement } from "@/features/layout/layout-types";

function annotationGeometry(element: TextLayoutElement | ListLayoutElement, spanId: string) {
  const spans = element.kind === "bullet-list"
    ? element.payload.items.flatMap((item) => item.spans)
    : element.payload.spans;
  const lines = element.kind === "bullet-list"
    ? element.payload.items.flatMap((item) => item.lines)
    : element.payload.lines;
  const targetIndex = spans.findIndex((span) => span.id === spanId);
  const target = spans[targetIndex];
  if (!target) return { x: 12, y: 30, width: element.box.width * 0.45, height: 28 };

  const before = spans.slice(0, targetIndex).reduce((sum, span) => sum + countGraphemes(span.text), 0);
  const targetLength = Math.max(1, countGraphemes(target.text));
  const lineLengths = lines.map((line) => Math.max(1, countGraphemes(line)));
  let remaining = before;
  let lineIndex = 0;
  while (lineIndex < lineLengths.length - 1 && remaining >= lineLengths[lineIndex]) {
    remaining -= lineLengths[lineIndex];
    lineIndex += 1;
  }

  const lineLength = lineLengths[lineIndex] ?? Math.max(1, targetLength);
  const leftInset = element.kind === "bullet-list" ? 42 : element.kind === "callout" ? 28 : 2;
  const usableWidth = element.box.width - leftInset - 8;
  const x = leftInset + usableWidth * Math.min(0.92, remaining / lineLength);
  const width = Math.min(usableWidth - (x - leftInset), Math.max(46, usableWidth * Math.min(1, targetLength / lineLength)));
  const lineHeight = 46;
  const y = lineIndex * lineHeight + 29;
  return { x, y, width, height: 30 };
}

export function AnnotationLayer({ element, progress }: { element: TextLayoutElement | ListLayoutElement; progress: Record<string, number> }) {
  const annotations = element.payload.annotations;
  if (!annotations.length) return null;
  return (
    <svg className="annotation-layer" viewBox={`0 0 ${element.box.width} ${element.box.height}`} aria-hidden="true">
      {annotations.map((annotation, index) => {
        const value = progress[`${element.id}:annotation:${annotation.id}`] ?? 0;
        const geometry = annotationGeometry(element, annotation.target.spanId);
        const wobble = index % 2 ? 2 : -2;
        if (annotation.type === "highlight") {
          return <path key={annotation.id} className="annotation-highlight" d={`M ${geometry.x} ${geometry.y} Q ${geometry.x + geometry.width * 0.48} ${geometry.y + wobble} ${geometry.x + geometry.width} ${geometry.y + 1}`} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
        }
        if (annotation.type === "circle") {
          return <ellipse key={annotation.id} className="annotation-blue" cx={geometry.x + geometry.width / 2} cy={geometry.y - 9} rx={geometry.width / 2 + 10} ry={geometry.height / 2 + 4} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
        }
        const lineY = annotation.type === "strike" ? geometry.y - 10 : geometry.y + 8;
        return <path key={annotation.id} className={annotation.type === "strike" ? "annotation-red" : "annotation-blue"} d={`M ${geometry.x - 2} ${lineY} Q ${geometry.x + geometry.width * 0.48} ${lineY + wobble} ${geometry.x + geometry.width + 4} ${lineY}`} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
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
      <path d={`M ${fromPoint.x} ${fromPoint.y} Q ${(fromPoint.x + toPoint.x) / 2 + 24} ${(fromPoint.y + toPoint.y) / 2 - 24} ${toPoint.x} ${toPoint.y}`} pathLength="1" markerEnd={`url(#head-${element.id})`} style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }} />
    </svg>
  );
}
