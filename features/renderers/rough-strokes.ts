interface Point { x: number; y: number; }

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function noise(seed: string, index: number) {
  let value = hashSeed(`${seed}:${index}`);
  value ^= value >>> 16;
  value = Math.imul(value, 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295 * 2 - 1;
}

function midpoint(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function closedSmoothPath(points: Point[]) {
  const start = midpoint(points.at(-1)!, points[0]);
  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const middle = midpoint(point, next);
    path += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${middle.x.toFixed(2)} ${middle.y.toFixed(2)}`;
  });
  return `${path} Z`;
}

function openSmoothPath(points: Point[]) {
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const middle = midpoint(points[index], points[index + 1]);
    path += ` Q ${points[index].x.toFixed(2)} ${points[index].y.toFixed(2)} ${middle.x.toFixed(2)} ${middle.y.toFixed(2)}`;
  }
  const last = points.at(-1)!;
  const control = points.at(-2)!;
  path += ` Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
}

export function roughEllipsePath(cx: number, cy: number, rx: number, ry: number, seed: string, rotation = 0, wobble = 2.2) {
  const points = Array.from({ length: 16 }, (_, index) => {
    const angle = rotation + (Math.PI * 2 * index) / 16;
    const radius = 1 + noise(seed, index) * wobble / Math.max(rx, ry);
    return {
      x: cx + Math.cos(angle) * rx * radius,
      y: cy + Math.sin(angle) * ry * radius,
    };
  });
  return closedSmoothPath(points);
}

export function roughLinePath(first: Point, second: Point, seed: string, options: { segments?: number; wobble?: number; bow?: number } = {}) {
  const segments = options.segments ?? 7;
  const wobble = options.wobble ?? 1.8;
  const bow = options.bow ?? 0;
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const length = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / length, y: dx / length };
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;
    const edgeDamping = Math.min(1, progress * 4, (1 - progress) * 4);
    const offset = (noise(seed, index) * wobble + Math.sin(progress * Math.PI) * bow) * edgeDamping;
    return {
      x: first.x + dx * progress + normal.x * offset,
      y: first.y + dy * progress + normal.y * offset,
    };
  });
  return openSmoothPath(points);
}

export function roughPolylinePath(points: Point[], seed: string, wobble = 1.4) {
  if (points.length < 2) return points[0] ? `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}` : "";
  const noisyPoints = points.map((point, index) => ({
    x: point.x + (index === 0 || index === points.length - 1 ? 0 : noise(seed, index * 2) * wobble),
    y: point.y + (index === 0 || index === points.length - 1 ? 0 : noise(seed, index * 2 + 1) * wobble),
  }));
  return openSmoothPath(noisyPoints);
}
