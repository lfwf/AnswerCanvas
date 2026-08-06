import type { FlowLayoutElement } from "@/features/layout/layout-types";

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
            <path className="flow-edge" d={`M ${from.x + 72} ${from.y} C ${from.x + 105} ${from.y - 18}, ${to.x - 105} ${to.y + 18}, ${to.x - 72} ${to.y}`} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 - value }} />
            {edge.label && <text x={(from.x + to.x) / 2} y={from.y - 24} textAnchor="middle">{edge.label}</text>}
          </g>
        );
      })}
      {nodes.map((node, index) => {
        const point = positions.get(node.id)!;
        const value = progress[`${element.id}:labels`] ?? 0;
        return (
          <g key={node.id} style={{ opacity: value }}>
            <ellipse className={`flow-node-ring ${index % 2 ? "green" : "blue"}`} cx={point.x} cy={point.y} rx="72" ry="34" transform={`rotate(${index % 2 ? 1.2 : -1.2} ${point.x} ${point.y})`} />
            <ellipse className={`flow-node-ring ${index % 2 ? "green" : "blue"}`} cx={point.x + 1} cy={point.y - 1} rx="70" ry="32" opacity="0.22" />
            <text x={point.x} y={point.y + 8} textAnchor="middle">{node.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
