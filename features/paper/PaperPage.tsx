import type { LayoutPage } from "@/features/layout/layout-types";
import { renderLayoutElement } from "@/features/renderers/renderer-registry";

function contentHeight(page: LayoutPage) {
  const bottom = page.elements.reduce((max, element) => Math.max(max, element.box.y + element.box.height), 0);
  return Math.min(1123, Math.max(420, bottom + 64));
}

export function PaperPage({ page, progress, scale }: { page: LayoutPage; progress: Record<string, number>; scale: number }) {
  const logicalHeight = contentHeight(page);
  return (
    <div className="paper-page-shell" data-page-index={page.index} style={{ width: 794 * scale, height: logicalHeight * scale }}>
      <article className="paper-page" aria-label={`答案画布第 ${page.index + 1} 段`} style={{ height: logicalHeight, transform: `scale(${scale})` }}>
        {page.elements.map((element) => renderLayoutElement(element, progress))}
      </article>
    </div>
  );
}
