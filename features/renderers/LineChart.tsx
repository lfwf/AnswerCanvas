import type { ChartLayoutElement } from "@/features/layout/layout-types";

function formatValue(value: number) {
  const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/u, "");
  return `${value > 0 ? "+" : ""}${rounded}`;
}

export function LineChart({ element, progress }: { element: ChartLayoutElement; progress: Record<string, number> }) {
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
  const pathFor = (points: number[]) => points.map((point, index) => `${index ? "L" : "M"} ${xFor(index, points.length)} ${yFor(point)}`).join(" ");
  const ticks = [0, 0.5, 1].map((ratio) => ({ ratio, value: min + ratio * span, y: bottom - ratio * (bottom - top) }));
  const visibleLabelIndexes = new Set([0, Math.floor((element.payload.labels.length - 1) / 2), element.payload.labels.length - 1]);
  const axisProgress = progress[`${element.id}:axis`] ?? 0;
  const labelsProgress = progress[`${element.id}:labels`] ?? 0;
  const drawStyle = { strokeDasharray: 1, strokeDashoffset: 1 - axisProgress };

  return (
    <svg className="chart-element handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }} viewBox={`0 0 ${element.box.width} ${element.box.height}`}>
      {element.payload.title && <text className="chart-title" x={left} y="26" style={{ opacity: labelsProgress }}>{element.payload.title}</text>}
      {ticks.map((tick) => (
        <g key={tick.ratio}>
          <path className="chart-grid" d={`M ${left} ${tick.y} L ${right} ${tick.y}`} pathLength="1" style={{ ...drawStyle, opacity: axisProgress * 0.06 }} />
          <path className="chart-tick" d={`M ${left - 7} ${tick.y} L ${left + 4} ${tick.y}`} pathLength="1" style={drawStyle} />
          <text x={left - 12} y={tick.y + 7} textAnchor="end" style={{ opacity: labelsProgress }}>{formatValue(tick.value)}</text>
        </g>
      ))}
      <path className="chart-axis" d={`M ${left} ${top - 5} L ${left} ${bottom} L ${right + 4} ${bottom}`} pathLength="1" style={drawStyle} />
      {element.payload.series.map((series) => {
        const value = progress[`${element.id}:series:${series.id}`] ?? 0;
        const path = pathFor(series.points);
        const lastPoint = series.points.at(-1) ?? 0;
        const lastX = xFor(series.points.length - 1, series.points.length);
        const lastY = yFor(lastPoint);
        return (
          <g key={series.id}>
            <path className="chart-line-shadow" d={path} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
            <path className={`chart-line ${series.color}`} d={path} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
            <text className="chart-series-label" x={Math.min(right - 122, lastX - 8)} y={Math.max(top + 20, lastY - 16)} style={{ opacity: Math.max(0, (value - 0.72) / 0.28) }}>{series.name} {formatValue(lastPoint)}</text>
          </g>
        );
      })}
      <g style={{ opacity: labelsProgress }}>
        {element.payload.labels.map((label, index) => visibleLabelIndexes.has(index) ? <text key={`${label}-${index}`} x={xFor(index, element.payload.labels.length)} y={bottom + 30} textAnchor="middle">{label}</text> : null)}
      </g>
    </svg>
  );
}
