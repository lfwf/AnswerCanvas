import type { RecreationMark, RecreationScene } from "./recreation-types";

const red = "#c62727";
const marks: RecreationMark[] = [
  { id: "skill-reusable-underline", kind: "mark", order: 22.1, targetId: "skill-definition", match: "可复用", mark: "underline", color: red, width: 1.7, offset: -1, wobble: 1.2 },
  { id: "skill-task-underline", kind: "mark", order: 22.2, targetId: "skill-definition", match: "子任务或功能", mark: "underline", color: red, width: 1.7, offset: -1, wobble: 1.2 },
  { id: "agent-perception-underline", kind: "mark", order: 32.1, targetId: "agent-definition", match: "感知环境", mark: "underline", color: red, width: 1.7, offset: -1, wobble: 1.2 },
  { id: "agent-goal-underline", kind: "mark", order: 32.2, targetId: "agent-definition", match: "达成目标", mark: "underline", color: red, width: 1.7, offset: -1, wobble: 1.2 },
  { id: "relation-combine-underline", kind: "mark", order: 54.1, targetId: "relation-summary", match: "调用和组合不同的 skill", mark: "underline", color: red, width: 1.7, offset: -1, wobble: 1.2 },
];

export function withCurrentSceneAnnotations(scene: RecreationScene): RecreationScene {
  return { ...scene, elements: [...scene.elements, ...marks] };
}
