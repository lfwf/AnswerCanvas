import type { FlowLayoutElement } from "@/features/layout/layout-types";
import { revealText } from "./TextRenderer";
import { roughEllipsePath, roughLinePath } from "./rough-strokes";

export function FlowDiagram({ element, progress }: { element: FlowLayoutElement; progress: Record<string, number> }) {
  const { nodes, edges } = element.payload;
  const pad = 72;
  const usable = element.box.width - pad * 2;
  const positions = new Map(nodes.map((node, index) => [node.id, {
    x: pad + (nodes.length === 1 ? usable / 2 : index * usable / (nodes.length - 1)),
    y: element.box.height / 2,
  }]));

  return (
    <svg className="diagram-element handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }} viewBox={`0 0 ${element.box.width} ${element.box.height}`}>
      {edges.map((edge, index) => {
        const from = positions.get(edge.from)!;
        const to = positions.get(edge.to)!;
        const value = progress[`${element.id}:edge:${index}`] ?? 0;
        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <path className="flow-edge" d={roughLinePath({ x: from.x + 72, y: from.y }, { x: to.x - 72, y: to.y }, `${element.id}:${edge.from}:${edge.to}:${index}`, { segments: 9, wobble: 2, bow: -18 })} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
            {edge.label && value >= 1 && <text x={(from.x + to.x) / 2} y={from.y - 24} textAnchor="middle">{edge.label}</text>}
          </g>
        );
      })}
      {nodes.map((node, index) => {
        const point = positions.get(node.id)!;
        const ringProgress = progress[`${element.id}:node-ring:${node.id}`] ?? 0;
        const labelProgress = progress[`${element.id}:node-label:${node.id}`] ?? 0;
        const drawStyle = { strokeDasharray: 1, strokeDashoffset: 1 - ringProgress };
        return (
          <g key={node.id}>
            <path className={`flow-node-ring ${index % 2 ? "green" : "blue"}`} d={roughEllipsePath(point.x, point.y, 72, 34, `${element.id}:${node.id}:outer`, index % 2 ? 0.02 : -0.04, 2.5)} pathLength="1" style={drawStyle} />
            <path className={`flow-node-ring ${index % 2 ? "green" : "blue"}`} d={roughEllipsePath(point.x + 1.5, point.y - 1, 70, 32, `${element.id}:${node.id}:echo`, 0.01, 2)} pathLength="1" opacity="0.24" style={drawStyle} />
            <text x={point.x} y={point.y + 8} textAnchor="middle">{revealText(node.label, labelProgress)}</text>
          </g>
        );
      })}
    </svg>
  );
}
