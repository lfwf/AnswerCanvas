import type { ArrowLayoutElement, ListLayoutElement, TextLayoutElement } from "@/features/layout/layout-types";

export function AnnotationLayer({ element, progress }: { element: TextLayoutElement | ListLayoutElement; progress: Record<string, number> }) {
  const annotations = element.payload.annotations;
  if (!annotations.length) return null;
  return <svg className="annotation-layer" viewBox={`0 0 ${element.box.width} ${element.box.height}`} aria-hidden="true">
    {annotations.map((annotation, index) => {
      const value = progress[`${element.id}:annotation:${annotation.id}`] ?? 0; const y = 12 + index * 15; const width = element.box.width * 0.66;
      if (annotation.type === "highlight") return <path key={annotation.id} className="annotation-highlight" d={`M 8 ${y + 24} Q ${width / 2} ${y + 19} ${width} ${y + 25}`} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
      if (annotation.type === "circle") return <ellipse key={annotation.id} className="annotation-blue" cx={width / 2} cy={y + 20} rx={Math.max(40, width / 2)} ry="25" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
      return <path key={annotation.id} className={annotation.type === "strike" ? "annotation-red" : "annotation-blue"} d={`M 8 ${y + (annotation.type === "strike" ? 14 : 30)} Q ${width / 2} ${y + 25} ${width} ${y + (annotation.type === "strike" ? 14 : 30)}`} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />;
    })}
  </svg>;
}

export function ArrowRenderer({ element, progress }: { element: ArrowLayoutElement; progress: number }) {
  const { fromPoint, toPoint } = element.payload;
  return <svg className="document-arrow" viewBox="0 0 794 1123" aria-hidden="true"><defs><marker id={`head-${element.id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="currentColor" /></marker></defs><path d={`M ${fromPoint.x} ${fromPoint.y} Q ${(fromPoint.x + toPoint.x) / 2 + 24} ${(fromPoint.y + toPoint.y) / 2 - 24} ${toPoint.x} ${toPoint.y}`} pathLength="1" markerEnd={`url(#head-${element.id})`} style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }} /></svg>;
}
