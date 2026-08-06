import type { LayoutPage } from "@/features/layout/layout-types";
import { renderLayoutElement } from "@/features/renderers/renderer-registry";
import { PenCursor } from "@/features/renderers/PenCursor";

export function PaperPage({ page, progress, scale, activeElementId, penVisible }: { page: LayoutPage; progress: Record<string, number>; scale: number; activeElementId: string | null; penVisible: boolean }) {
  const active = activeElementId ? page.elements.find((element) => activeElementId.startsWith(element.id)) : undefined;
  return <div className="paper-page-shell" data-page-index={page.index} style={{ width: 794 * scale, height: 1123 * scale }}><article className="paper-page" aria-label={`笔记第 ${page.index + 1} 页`} style={{ transform: `scale(${scale})` }}>{page.elements.map((element) => renderLayoutElement(element, progress))}<PenCursor box={active?.box ?? null} visible={penVisible && Boolean(active)} /></article></div>;
}
