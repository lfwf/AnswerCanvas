import type { RecreationElement, RecreationMark, RecreationScene, RecreationText } from "./recreation-types";

const red = "#c62727";
const markSpecs = [
  { id: "skill-reusable-underline", targetId: "skill-definition", match: "可复用" },
  { id: "skill-task-underline", targetId: "skill-definition", match: "子任务或功能" },
  { id: "agent-perception-underline", targetId: "agent-definition", match: "感知环境" },
  { id: "agent-goal-underline", targetId: "agent-definition", match: "达成目标" },
  { id: "relation-combine-underline", targetId: "relation-summary", match: "调用和组合不同的 skill" },
] as const;

const headerIds = new Set(["date", "course", "topic", "page-number"]);
const lineHeightOverrides: Record<string, number> = {
  "cue-skill": 31,
  "skill-definition": 31,
  "skill-points": 31,
  "cue-agent": 31,
  "agent-definition": 31,
  "agent-points": 31,
  "cue-relation": 31,
  summary: 31,
};
const nudges: Record<string, { x?: number; y?: number; baseline?: number }> = {
  "cue-heading": { y: -1 },
  "notes-heading": { y: -1 },
  "skill-title": { y: 1 },
  "agent-title": { y: 1 },
  "relation-title": { y: 1 },
  "relation-summary": { y: -2 },
  "summary-title": { y: 1 },
};

function isDiagramText(id: string) {
  return id === "skill-example"
    || (id.startsWith("agent-") && id.endsWith("-label"))
    || id.startsWith("comparison-")
    || id.startsWith("summary-diagram")
    || id.startsWith("summary-agent")
    || id.startsWith("summary-skill");
}

function tuneText(element: RecreationText): RecreationText {
  const diagram = isDiagramText(element.id);
  const nudge = nudges[element.id];
  return {
    ...element,
    style: {
      ...element.style,
      snapToRule: !headerIds.has(element.id) && !diagram && element.id !== "relation-summary",
      lineHeight: lineHeightOverrides[element.id] ?? element.style?.lineHeight,
      nudgeX: nudge?.x,
      nudgeY: nudge?.y,
      baselineShift: nudge?.baseline,
      characterJitter: diagram ? 0.28 : 0.72,
    },
  };
}

function tuneShape(element: RecreationElement): RecreationElement {
  if (element.kind === "stroke") {
    const table = element.id.startsWith("comparison-");
    const arrow = element.id.includes("arrow");
    return {
      ...element,
      handDrawn: element.handDrawn ?? true,
      roughness: element.roughness ?? (table ? 0.58 : arrow ? 0.78 : 0.86),
      bowing: element.bowing ?? (table ? 0.34 : arrow ? 0.52 : 0.55),
    };
  }
  if (element.kind === "box") {
    const frame = element.id === "page-frame";
    return {
      ...element,
      handDrawn: element.handDrawn ?? true,
      roughness: element.roughness ?? (frame ? 0.62 : 0.82),
      bowing: element.bowing ?? (frame ? 0.35 : 0.55),
    };
  }
  return element;
}

function buildMarks(scene: RecreationScene): RecreationMark[] {
  const orders = new Map(scene.elements.map((element) => [element.id, element.order]));
  return markSpecs.map((spec, index) => ({
    id: spec.id,
    kind: "mark",
    order: (orders.get(spec.targetId) ?? 0) + 0.1 + index * 0.01,
    targetId: spec.targetId,
    match: spec.match,
    mark: "underline",
    color: red,
    width: 1.7,
    offset: -5,
    padding: 1.5,
    wobble: 1.2,
  }));
}

export function withCurrentSceneAnnotations(scene: RecreationScene): RecreationScene {
  const tunedElements = scene.elements.map((element) => element.kind === "text" ? tuneText(element) : tuneShape(element));
  return {
    ...scene,
    paper: {
      background: "#faf9ee",
      ruleColor: "rgba(84,113,139,.16)",
      ruleSpacing: 31,
      ruleThickness: 1,
      ruleOffset: 30,
    },
    elements: [...tunedElements, ...buildMarks(scene)],
  };
}
