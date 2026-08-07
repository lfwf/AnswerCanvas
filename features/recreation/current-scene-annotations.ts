import type { RecreationMark, RecreationScene, RecreationText } from "./recreation-types";

const red = "#c62727";
const underline = (id: string, order: number, targetId: string, match: string): RecreationMark => ({
  id,
  kind: "mark",
  order,
  targetId,
  match,
  mark: "underline",
  color: red,
  width: 1.7,
  offset: -5,
  padding: 1.5,
  wobble: 1.2,
});

const marks: RecreationMark[] = [
  underline("skill-reusable-underline", 22.1, "skill-definition", "可复用"),
  underline("skill-task-underline", 22.2, "skill-definition", "子任务或功能"),
  underline("agent-perception-underline", 32.1, "agent-definition", "感知环境"),
  underline("agent-goal-underline", 32.2, "agent-definition", "达成目标"),
  underline("relation-combine-underline", 54.1, "relation-summary", "调用和组合不同的 skill"),
];

const unsnapped = new Set([
  "date", "course", "topic", "page-number",
  "skill-example", "agent-diagram-label", "comparison", "relation-summary",
  "summary-diagram-title", "summary-agent", "summary-skill-labels",
]);
const centeredOrDiagram = new Set(["skill-example", "agent-diagram-label", "comparison", "summary-diagram-title", "summary-agent", "summary-skill-labels"]);
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

function tuneText(element: RecreationText): RecreationText {
  const nudge = nudges[element.id];
  return {
    ...element,
    style: {
      ...element.style,
      snapToRule: !unsnapped.has(element.id),
      lineHeight: lineHeightOverrides[element.id] ?? element.style?.lineHeight,
      nudgeX: nudge?.x,
      nudgeY: nudge?.y,
      baselineShift: nudge?.baseline,
      characterJitter: centeredOrDiagram.has(element.id) ? 0.3 : 0.72,
    },
  };
}

export function withCurrentSceneAnnotations(scene: RecreationScene): RecreationScene {
  return {
    ...scene,
    paper: {
      background: "#faf9ee",
      ruleColor: "rgba(84,113,139,.16)",
      ruleSpacing: 31,
      ruleThickness: 1,
      ruleOffset: 30,
    },
    elements: [...scene.elements.map((element) => element.kind === "text" ? tuneText(element) : element), ...marks],
  };
}
