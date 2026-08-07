import { createSeededRandom, seedFromString, seededRange } from "@/features/layout/seeded-random";
import type { RecreationBox, RecreationStroke } from "./recreation-types";

export interface HandDrawnPass {
  id: string;
  path: string;
  opacity: number;
  widthScale: number;
}

interface Point { x: number; y: number; }
interface LineSegment { kind: "line"; start: Point; end: Point; }
interface CubicSegment { kind: "cubic"; start: Point; c1: Point; c2: Point; end: Point; }
interface QuadraticSegment { kind: "quadratic"; start: Point; control: Point; end: Point; }
type PathSegment = LineSegment | CubicSegment | QuadraticSegment;

const NUMBER = "[-+]?(?:\\d*\\.)?\\d+(?:[eE][-+]?\\d+)?";
const PATH_TOKEN = new RegExp(`[MLCQZmlcqz]|${NUMBER}`, "g");

function round(value: number) { return Math.round(value * 100) / 100; }
function point(x: number, y: number) { return `${round(x)} ${round(y)}`; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function samePoint(a: Point, b: Point) { return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001; }
function absolutePoint(x: number, y: number, relative: boolean, origin: Point): Point { return relative ? { x: origin.x + x, y: origin.y + y } : { x, y }; }

function parsePathSegments(path: string): PathSegment[] | null {
  const tokens = path.match(PATH_TOKEN);
  if (!tokens?.length) return null;
  const remainder = path.replace(PATH_TOKEN, "").replace(/[\s,]+/g, "");
  if (remainder) return null;
  const segments: PathSegment[] = [];
  let index = 0;
  let current: Point = { x: 0, y: 0 };
  let subpathStart: Point | null = null;

  const readNumber = () => {
    const value = Number(tokens[index++]);
    return Number.isFinite(value) ? value : null;
  };

  while (index < tokens.length) {
    const command = tokens[index++];
    if (!/^[MLCQZ]$/i.test(command)) return null;
    const upper = command.toUpperCase();
    const relative = command === command.toLowerCase();

    if (upper === "Z") {
      if (subpathStart && !samePoint(current, subpathStart)) segments.push({ kind: "line", start: current, end: subpathStart });
      if (subpathStart) current = subpathStart;
      continue;
    }

    if (upper === "M" || upper === "L") {
      const x = readNumber();
      const y = readNumber();
      if (x === null || y === null) return null;
      const next = absolutePoint(x, y, relative, current);
      if (upper === "M") subpathStart = next;
      else segments.push({ kind: "line", start: current, end: next });
      current = next;
      continue;
    }

    if (upper === "C") {
      const values = Array.from({ length: 6 }, readNumber);
      if (values.some((value) => value === null)) return null;
      const [x1, y1, x2, y2, x, y] = values as number[];
      const c1 = absolutePoint(x1, y1, relative, current);
      const c2 = absolutePoint(x2, y2, relative, current);
      const end = absolutePoint(x, y, relative, current);
      segments.push({ kind: "cubic", start: current, c1, c2, end });
      current = end;
      continue;
    }

    const values = Array.from({ length: 4 }, readNumber);
    if (values.some((value) => value === null)) return null;
    const [cx, cy, x, y] = values as number[];
    const control = absolutePoint(cx, cy, relative, current);
    const end = absolutePoint(x, y, relative, current);
    segments.push({ kind: "quadratic", start: current, control, end });
    current = end;
  }
  return segments.length ? segments : null;
}

export function parseLineSegments(path: string): Array<{ start: Point; end: Point }> | null {
  const segments = parsePathSegments(path);
  if (!segments || segments.some((segment) => segment.kind !== "line")) return null;
  return segments.map(({ start, end }) => ({ start, end }));
}

export function parseSimpleLinePath(path: string): { start: Point; end: Point } | null {
  const segments = parseLineSegments(path);
  return segments?.length === 1 ? segments[0] : null;
}

function jitterPoint(source: Point, random: () => number, amount: number): Point {
  return { x: source.x + seededRange(random, -amount, amount), y: source.y + seededRange(random, -amount, amount) };
}

function roughLinePath(start: Point, end: Point, random: () => number, roughness: number, bowing: number, pass: number) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;
  const endpointNoise = roughness * (pass === 0 ? 0.12 : 0.3);
  const lateral = seededRange(random, -roughness, roughness) + (pass === 0 ? 0 : seededRange(random, -0.55, 0.55));
  const bow = clamp(length / 240, 0.35, 1.8) * bowing * seededRange(random, -1, 1);
  const startPoint = jitterPoint(start, random, endpointNoise);
  const endPoint = jitterPoint(end, random, endpointNoise);
  const c1 = { x: startPoint.x + dx * 0.32 + nx * (lateral + bow), y: startPoint.y + dy * 0.32 + ny * (lateral + bow) };
  const c2 = { x: startPoint.x + dx * 0.68 + nx * (lateral - bow * 0.35), y: startPoint.y + dy * 0.68 + ny * (lateral - bow * 0.35) };
  return `M ${point(startPoint.x, startPoint.y)} C ${point(c1.x, c1.y)} ${point(c2.x, c2.y)} ${point(endPoint.x, endPoint.y)}`;
}

function roughCubicPath(segment: CubicSegment, random: () => number, roughness: number, pass: number) {
  const endpointNoise = roughness * (pass === 0 ? 0.12 : 0.3);
  const controlNoise = roughness * (pass === 0 ? 0.34 : 0.7);
  const start = jitterPoint(segment.start, random, endpointNoise);
  const c1 = jitterPoint(segment.c1, random, controlNoise);
  const c2 = jitterPoint(segment.c2, random, controlNoise);
  const end = jitterPoint(segment.end, random, endpointNoise);
  return `M ${point(start.x, start.y)} C ${point(c1.x, c1.y)} ${point(c2.x, c2.y)} ${point(end.x, end.y)}`;
}

function roughQuadraticPath(segment: QuadraticSegment, random: () => number, roughness: number, pass: number) {
  const endpointNoise = roughness * (pass === 0 ? 0.12 : 0.3);
  const controlNoise = roughness * (pass === 0 ? 0.34 : 0.7);
  const start = jitterPoint(segment.start, random, endpointNoise);
  const control = jitterPoint(segment.control, random, controlNoise);
  const end = jitterPoint(segment.end, random, endpointNoise);
  return `M ${point(start.x, start.y)} Q ${point(control.x, control.y)} ${point(end.x, end.y)}`;
}

function roughSegmentPath(segment: PathSegment, random: () => number, roughness: number, bowing: number, pass: number) {
  if (segment.kind === "line") return roughLinePath(segment.start, segment.end, random, roughness, bowing, pass);
  if (segment.kind === "cubic") return roughCubicPath(segment, random, roughness, pass);
  return roughQuadraticPath(segment, random, roughness, pass);
}

export function buildHandDrawnStrokePasses(stroke: RecreationStroke): HandDrawnPass[] {
  if (stroke.handDrawn === false) return [{ id: `${stroke.id}:clean`, path: stroke.path, opacity: 1, widthScale: 1 }];
  const segments = parsePathSegments(stroke.path);
  if (!segments) return [{ id: `${stroke.id}:source`, path: stroke.path, opacity: 1, widthScale: 1 }];
  const roughness = stroke.roughness ?? 1.05;
  const bowing = stroke.bowing ?? 0.85;
  const random = createSeededRandom(seedFromString(stroke.id));
  const count = stroke.dash ? 1 : 2;
  return Array.from({ length: count }, (_, passIndex) => ({
    id: `${stroke.id}:pass-${passIndex}`,
    path: segments.map((segment) => roughSegmentPath(segment, random, roughness, bowing, passIndex)).join(" "),
    opacity: passIndex === 0 ? 0.88 : 0.24,
    widthScale: passIndex === 0 ? 1 : 0.82,
  }));
}

function edgeCommands(start: Point, end: Point, random: () => number, roughness: number, bowing: number, pass: number) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;
  const tx = dx / length;
  const ty = dy / length;
  const segmentCount = clamp(Math.round(length / 105), 2, 8);
  const scale = roughness * clamp(length / 220, 1.15, 2.45) * (pass === 0 ? 1 : 1.28);
  const commands: string[] = [];

  for (let index = 1; index <= segmentCount; index += 1) {
    const t0 = (index - 1) / segmentCount;
    const t1 = index / segmentCount;
    const tm = (t0 + t1) / 2;
    const endNoise = index === segmentCount ? 0 : seededRange(random, -scale * .34, scale * .34);
    const tangentNoise = index === segmentCount ? 0 : seededRange(random, -roughness * .28, roughness * .28);
    const target = {
      x: start.x + dx * t1 + nx * endNoise + tx * tangentNoise,
      y: start.y + dy * t1 + ny * endNoise + ty * tangentNoise,
    };
    const bow = seededRange(random, -scale, scale) + seededRange(random, -bowing, bowing) * clamp(length / 180, .8, 2.2);
    const control = {
      x: start.x + dx * tm + nx * bow + tx * seededRange(random, -roughness * .22, roughness * .22),
      y: start.y + dy * tm + ny * bow + ty * seededRange(random, -roughness * .22, roughness * .22),
    };
    commands.push(`Q ${point(control.x, control.y)} ${point(target.x, target.y)}`);
  }
  return commands.join(" ");
}

function handDrawnRectPath(box: RecreationBox, random: () => number, pass: number) {
  const roughness = box.roughness ?? 1.05;
  const bowing = box.bowing ?? 0.7;
  const passOffset = pass === 0 ? 0 : seededRange(random, -roughness * .55, roughness * .55);
  const x = box.x + passOffset + seededRange(random, -roughness * .22, roughness * .22);
  const y = box.y + seededRange(random, -roughness * .22, roughness * .22);
  const width = box.width + seededRange(random, -roughness * .75, roughness * .75);
  const height = box.height + seededRange(random, -roughness * .75, roughness * .75);
  const authoredRadius = clamp(box.radius ?? 0, 0, Math.min(width, height) / 2);
  const radius = authoredRadius > 0 ? authoredRadius : clamp(roughness * 2.4, 2.5, 7);

  const topLeft = { x: x + radius, y };
  const topRight = { x: x + width - radius, y };
  const rightTop = { x: x + width, y: y + radius };
  const rightBottom = { x: x + width, y: y + height - radius };
  const bottomRight = { x: x + width - radius, y: y + height };
  const bottomLeft = { x: x + radius, y: y + height };
  const leftBottom = { x, y: y + height - radius };
  const leftTop = { x, y: y + radius };
  const cornerNoise = roughness * (pass === 0 ? .45 : .8);
  const corner = (cx: number, cy: number) => ({ x: cx + seededRange(random, -cornerNoise, cornerNoise), y: cy + seededRange(random, -cornerNoise, cornerNoise) });

  return [
    `M ${point(topLeft.x, topLeft.y)}`,
    edgeCommands(topLeft, topRight, random, roughness, bowing, pass),
    `Q ${point(corner(x + width, y).x, corner(x + width, y).y)} ${point(rightTop.x, rightTop.y)}`,
    edgeCommands(rightTop, rightBottom, random, roughness, bowing, pass),
    `Q ${point(corner(x + width, y + height).x, corner(x + width, y + height).y)} ${point(bottomRight.x, bottomRight.y)}`,
    edgeCommands(bottomRight, bottomLeft, random, roughness, bowing, pass),
    `Q ${point(corner(x, y + height).x, corner(x, y + height).y)} ${point(leftBottom.x, leftBottom.y)}`,
    edgeCommands(leftBottom, leftTop, random, roughness, bowing, pass),
    `Q ${point(corner(x, y).x, corner(x, y).y)} ${point(topLeft.x, topLeft.y)}`,
  ].join(" ");
}

export function buildHandDrawnBoxPasses(box: RecreationBox): HandDrawnPass[] {
  if (box.handDrawn === false) {
    const x2 = box.x + box.width;
    const y2 = box.y + box.height;
    return [{ id: `${box.id}:clean`, path: `M ${point(box.x, box.y)} L ${point(x2, box.y)} L ${point(x2, y2)} L ${point(box.x, y2)} Z`, opacity: 1, widthScale: 1 }];
  }
  const random = createSeededRandom(seedFromString(box.id));
  const count = box.dash ? 1 : 2;
  return Array.from({ length: count }, (_, index) => ({
    id: `${box.id}:pass-${index}`,
    path: handDrawnRectPath(box, random, index),
    opacity: index === 0 ? 0.9 : 0.24,
    widthScale: index === 0 ? 1 : 0.8,
  }));
}