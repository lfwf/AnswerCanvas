import { createSeededRandom, seedFromString, seededRange } from "@/features/layout/seeded-random";
import type { RecreationBox, RecreationStroke } from "./recreation-types";

export interface HandDrawnPass {
  id: string;
  path: string;
  opacity: number;
  widthScale: number;
}

interface Point { x: number; y: number; }
interface LineSegment { start: Point; end: Point; }

const NUMBER = "[-+]?(?:\\d*\\.)?\\d+(?:[eE][-+]?\\d+)?";
const PATH_TOKEN = new RegExp(`[MLml]|${NUMBER}`, "g");

function round(value: number) { return Math.round(value * 100) / 100; }
function point(x: number, y: number) { return `${round(x)} ${round(y)}`; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

export function parseLineSegments(path: string): LineSegment[] | null {
  const tokens = path.match(PATH_TOKEN);
  if (!tokens?.length) return null;
  const remainder = path.replace(PATH_TOKEN, "").replace(/[\s,]+/g, "");
  if (remainder) return null;
  const segments: LineSegment[] = [];
  let index = 0;
  let current: Point | null = null;
  while (index < tokens.length) {
    const command = tokens[index++];
    if (!/^[ML]$/i.test(command)) return null;
    const x = Number(tokens[index++]);
    const y = Number(tokens[index++]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const relative = command === command.toLowerCase();
    const next: Point = { x: relative && current ? current.x + x : x, y: relative && current ? current.y + y : y };
    if (/^L$/i.test(command)) {
      if (!current) return null;
      segments.push({ start: current, end: next });
    }
    current = next;
  }
  return segments.length ? segments : null;
}

export function parseSimpleLinePath(path: string): { start: Point; end: Point } | null {
  const segments = parseLineSegments(path);
  return segments?.length === 1 ? segments[0] : null;
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
  const sx = start.x + seededRange(random, -endpointNoise, endpointNoise);
  const sy = start.y + seededRange(random, -endpointNoise, endpointNoise);
  const ex = end.x + seededRange(random, -endpointNoise, endpointNoise);
  const ey = end.y + seededRange(random, -endpointNoise, endpointNoise);
  const c1 = { x: sx + dx * 0.32 + nx * (lateral + bow), y: sy + dy * 0.32 + ny * (lateral + bow) };
  const c2 = { x: sx + dx * 0.68 + nx * (lateral - bow * 0.35), y: sy + dy * 0.68 + ny * (lateral - bow * 0.35) };
  return `M ${point(sx, sy)} C ${point(c1.x, c1.y)} ${point(c2.x, c2.y)} ${point(ex, ey)}`;
}

export function buildHandDrawnStrokePasses(stroke: RecreationStroke): HandDrawnPass[] {
  if (stroke.handDrawn === false) return [{ id: `${stroke.id}:clean`, path: stroke.path, opacity: 1, widthScale: 1 }];
  const segments = parseLineSegments(stroke.path);
  if (!segments) return [{ id: `${stroke.id}:source`, path: stroke.path, opacity: 1, widthScale: 1 }];
  const roughness = stroke.roughness ?? 1.05;
  const bowing = stroke.bowing ?? 0.85;
  const random = createSeededRandom(seedFromString(stroke.id));
  const count = stroke.dash ? 1 : 2;
  return Array.from({ length: count }, (_, passIndex) => ({
    id: `${stroke.id}:pass-${passIndex}`,
    path: segments.map((segment) => roughLinePath(segment.start, segment.end, random, roughness, bowing, passIndex)).join(" "),
    opacity: passIndex === 0 ? 0.88 : 0.24,
    widthScale: passIndex === 0 ? 1 : 0.82,
  }));
}

function roundedRectPath(box: RecreationBox, random: () => number, pass: number) {
  const roughness = box.roughness ?? 1.05;
  const bowing = box.bowing ?? 0.7;
  const offset = pass === 0 ? 0 : seededRange(random, -0.55, 0.55);
  const x = box.x + offset;
  const y = box.y + seededRange(random, -roughness * 0.16, roughness * 0.16);
  const width = box.width + seededRange(random, -roughness * 0.22, roughness * 0.22);
  const height = box.height + seededRange(random, -roughness * 0.22, roughness * 0.22);
  const radius = clamp(box.radius ?? 0, 0, Math.min(width, height) / 2);
  const topBow = seededRange(random, -bowing, bowing) * clamp(width / 260, 0.4, 1.7);
  const rightBow = seededRange(random, -bowing, bowing) * clamp(height / 220, 0.4, 1.5);
  const bottomBow = seededRange(random, -bowing, bowing) * clamp(width / 260, 0.4, 1.7);
  const leftBow = seededRange(random, -bowing, bowing) * clamp(height / 220, 0.4, 1.5);
  const r = radius;
  return [
    `M ${point(x + r, y)}`,
    `C ${point(x + width * 0.33, y + topBow)} ${point(x + width * 0.67, y - topBow * 0.35)} ${point(x + width - r, y)}`,
    `Q ${point(x + width, y)} ${point(x + width, y + r)}`,
    `C ${point(x + width + rightBow, y + height * 0.33)} ${point(x + width - rightBow * 0.35, y + height * 0.67)} ${point(x + width, y + height - r)}`,
    `Q ${point(x + width, y + height)} ${point(x + width - r, y + height)}`,
    `C ${point(x + width * 0.67, y + height + bottomBow)} ${point(x + width * 0.33, y + height - bottomBow * 0.35)} ${point(x + r, y + height)}`,
    `Q ${point(x, y + height)} ${point(x, y + height - r)}`,
    `C ${point(x + leftBow, y + height * 0.67)} ${point(x - leftBow * 0.35, y + height * 0.33)} ${point(x, y + r)}`,
    `Q ${point(x, y)} ${point(x + r, y)}`,
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
    path: roundedRectPath(box, random, index),
    opacity: index === 0 ? 0.9 : 0.22,
    widthScale: index === 0 ? 1 : 0.8,
  }));
}
