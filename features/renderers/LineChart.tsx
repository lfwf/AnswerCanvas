import type { ChartLayoutElement } from "@/features/layout/layout-types";
function pathFor(points: number[], width: number, height: number) { const min = Math.min(...points), max = Math.max(...points), span = max - min || 1; return points.map((point, index) => `${index ? "L" : "M"} ${50 + index * (width - 90) / Math.max(1, points.length - 1)} ${height - 42 - (point - min) / span * (height - 90)}`).join(" "); }
export function LineChart({ element, progress }: { element: ChartLayoutElement; progress: Record<string, number> }) {
  const labelsProgress = progress[`${element.id}:labels`] ?? 0;
  return <svg className="chart-element handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }} viewBox={`0 0 ${element.box.width} ${element.box.height}`}>
    <path className="chart-axis" d={`M 44 25 L 44 ${element.box.height - 38} L ${element.box.width - 25} ${element.box.height - 38}`} />
    {element.payload.series.map((series) => <path key={series.id} className={`chart-line ${series.color}`} d={pathFor(series.points, element.box.width, element.box.height)} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - (progress[`${element.id}:series:${series.id}`] ?? 0) }} />)}
    <g style={{ opacity: labelsProgress }}>{element.payload.labels.map((label, index) => <text key={`${label}-${index}`} x={50 + index * (element.box.width - 90) / Math.max(1, element.payload.labels.length - 1)} y={element.box.height - 14} textAnchor="middle">{label}</text>)}</g>
  </svg>;
}
