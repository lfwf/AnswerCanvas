import type { RecreationMark, RecreationScene } from "./recreation-types";

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

export function withCurrentSceneAnnotations(scene: RecreationScene): RecreationScene {
  return { ...scene, elements: [...scene.elements, ...marks] };
}
