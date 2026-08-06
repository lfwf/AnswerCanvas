import type { ChartLayoutElement } from "@/features/layout/layout-types";
import { revealText } from "./TextRenderer";
import { roughLinePath, roughPolylinePath } from "./rough-strokes";

function formatValue(value: number, percent: boolean) {
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/u, "");
  return `${value > 0 ? "+" : ""}${rounded}${percent ? "%" : ""}`;
}

export function LineChart({ element, progress }: { element: ChartLayoutElement; progress: Record<string, number> }) {
  const semanticText = [element.payload.title ?? "", ...element.payload.series.map((series) => series.name)].join(" ");
  const percentChart = /NVIDIA|AMD|股票|股价|涨幅|收益|回报|stock|performance|return/i.test(semanticText);
  const allPoints = element.payload.series.flatMap((series) => series.points);
  const min = Math.min(0, ...allPoints);
  const max = Math.max(0, ...allPoints);
  const span = max - min || 1;
  const left = 58;
  const right = element.box.width - 36;
  const top = element.payload.title ? 48 : 30;
  const bottom = element.box.height - 48;
  const xFor = (index: number, count: number) => left + index * (right - left) / Math.max(1, count - 1);
  const yFor = (value: number) => bottom - (value - min) / span * (bottom - top);
  const pathFor = (points: number[], seed: string) => roughPolylinePath(points.map((point, index) => ({ x: xFor(index, points.length), y: yFor(point) })), seed, 1.2);
  const ticks = [0, 0.5, 1].map((ratio) => ({ ratio, value: min + ratio * span, y: bottom - ratio * (bottom - top) }));
  const xIndexes = Array.from(new Set([0, Math.floor((element.payload.labels.length - 1) / 2), element.payload.labels.length - 1]));
  const axisProgress = progress[`${element.id}:axis`] ?? 0;
  const drawStyle = { strokeDasharray: 1, strokeDashoffset: 1 - axisProgress };

  return (
    <svg className="chart-element handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }} viewBox={`0 0 ${element.box.width} ${element.box.height}`}>
      {element.payload.title && <text className="chart-title" x={left} y="26">{revealText(element.payload.title, progress[`${element.id}:title`] ?? 0)}</text>}
      {ticks.map((tick, index) => {
        const label = formatValue(tick.value, percentChart);
        return (
          <g key={tick.ratio}>
            <path className="chart-grid" d={roughLinePath({ x: left, y: tick.y }, { x: right, y: tick.y }, `${element.id}:grid:${index}`, { segments: 6, wobble: 0.6 })} pathLength="1" style={{ ...drawStyle, opacity: axisProgress * 0.06 }} />
            <path className="chart-tick" d={roughLinePath({ x: left - 7, y: tick.y }, { x: left + 4, y: tick.y }, `${element.id}:tick:${index}`, { segments: 3, wobble: 0.5 })} pathLength="1" style={drawStyle} />
            <text x={left - 12} y={tick.y + 7} textAnchor="end">{revealText(label, progress[`${element.id}:y-label:${index}`] ?? 0)}</text>
          </g>
        );
      })}
      <path className="chart-axis" d={`${roughLinePath({ x: left, y: top - 5 }, { x: left, y: bottom }, `${element.id}:axis-y`, { segments: 5, wobble: 0.7 })} ${roughLinePath({ x: left, y: bottom }, { x: right + 4, y: bottom }, `${element.id}:axis-x`, { segments: 7, wobble: 0.7 })}`} pathLength="1" style={drawStyle} />
      {element.payload.series.map((series) => {
        const pathProgress = progress[`${element.id}:series:${series.id}`] ?? 0;
        const labelProgress = progress[`${element.id}:series-label:${series.id}`] ?? 0;
        const path = pathFor(series.points, `${element.id}:${series.id}`);
        const lastPoint = series.points.at(-1) ?? 0;
        const lastX = xFor(series.points.length - 1, series.points.length);
        const lastY = yFor(lastPoint);
        const label = `${series.name} ${formatValue(lastPoint, percentChart)}`;
        return (
          <g key={series.id}>
            <path className="chart-line-shadow" d={path} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - pathProgress }} />
            <path className={`chart-line ${series.color}`} d={path} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - pathProgress }} />
            <text className={`chart-series-label ${series.color}`} x={Math.min(right - 150, lastX - 8)} y={Math.max(top + 20, lastY - 16)}>{revealText(label, labelProgress)}</text>
          </g>
        );
      })}
      {xIndexes.map((index) => (
        <text key={`${element.payload.labels[index]}-${index}`} x={xFor(index, element.payload.labels.length)} y={bottom + 30} textAnchor="middle">
          {revealText(element.payload.labels[index], progress[`${element.id}:x-label:${index}`] ?? 0)}
        </text>
      ))}
    </svg>
  );
}
