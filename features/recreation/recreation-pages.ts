import type { RecreationPageTurn, RecreationScene } from "./recreation-types";

export interface RecreationPagePresentation {
  currentPageId?: string;
  outgoingPageId?: string;
  incomingPageId?: string;
  transitionProgress: number;
  transition: "slide" | "fade";
}

function pageTurns(scene: RecreationScene): RecreationPageTurn[] {
  return scene.elements.filter((element): element is RecreationPageTurn => element.kind === "page").sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function pagePresentationFor(scene: RecreationScene, progress: Record<string, number> | undefined, completed = false): RecreationPagePresentation {
  const firstPageId = scene.pages?.[0]?.id;
  if (!firstPageId) return { currentPageId: undefined, transitionProgress: 1, transition: "slide" };
  let currentPageId = firstPageId;
  for (const turn of pageTurns(scene)) {
    const value = completed ? 1 : Math.max(0, Math.min(1, progress?.[turn.id] ?? 0));
    if (value <= 0) break;
    if (value < 1) return {
      currentPageId,
      outgoingPageId: currentPageId,
      incomingPageId: turn.pageId,
      transitionProgress: value,
      transition: turn.transition ?? "slide",
    };
    currentPageId = turn.pageId;
  }
  return { currentPageId, transitionProgress: 1, transition: "slide" };
}
