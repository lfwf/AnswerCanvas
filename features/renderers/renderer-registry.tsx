import type { ComparisonLayoutElement, LayoutElement } from "@/features/layout/layout-types";
import { countGraphemes } from "@/lib/text/graphemes";
import { ArrowRenderer } from "./AnnotationLayer";
import { FlowDiagram } from "./FlowDiagram";
import { LineChart } from "./LineChart";
import { QuestionHeader } from "./QuestionHeader";
import { ListRenderer, revealText, TextRenderer, TitleRenderer } from "./TextRenderer";

function ComparisonRenderer({ element, progress }: { element: ComparisonLayoutElement; progress: number }) {
  const leftCount = element.payload.left.items.length + 1;
  const ordered = [element.payload.left.title, ...element.payload.left.items, element.payload.right.title, ...element.payload.right.items];
  const lengths = ordered.map(countGraphemes);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const revealed = Math.floor(total * Math.min(1, Math.max(0, progress)));
  const visible = ordered.map((text, index) => {
    const start = lengths.slice(0, index).reduce((sum, length) => sum + length, 0);
    const localVisible = Math.min(lengths[index], Math.max(0, revealed - start));
    return revealText(text, lengths[index] ? localVisible / lengths[index] : 1);
  });
  const leftTitle = visible[0];
  const leftItems = visible.slice(1, leftCount);
  const rightTitle = visible[leftCount];
  const rightItems = visible.slice(leftCount + 1);

  return (
    <section className="comparison handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }}>
      <div><h3>{leftTitle}</h3>{leftItems.map((item, index) => <p key={`${element.id}-left-${index}`}>{item || "\u00a0"}</p>)}</div>
      <div><h3>{rightTitle}</h3>{rightItems.map((item, index) => <p key={`${element.id}-right-${index}`}>{item || "\u00a0"}</p>)}</div>
    </section>
  );
}
export function renderLayoutElement(element: LayoutElement, progress: Record<string, number>) {
  if (element.kind === "question") return <QuestionHeader key={element.id} element={element} />;
  if (element.kind === "title") return <TitleRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} />;
  if (element.kind === "text" || element.kind === "callout") return <TextRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} targetProgress={progress} />;
  if (element.kind === "bullet-list") return <ListRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} targetProgress={progress} />;
  if (element.kind === "comparison") return <ComparisonRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} />;
  if (element.kind === "flow-diagram") return <FlowDiagram key={element.id} element={element} progress={progress} />;
  if (element.kind === "line-chart") return <LineChart key={element.id} element={element} progress={progress} />;
  if (element.kind === "arrow") return <ArrowRenderer key={element.id} element={element} progress={progress[`${element.id}:path`] ?? 0} />;
  if (element.kind === "footer") return <div key={element.id} className="truncated-footer" style={{ left: element.box.x, top: element.box.y, width: element.box.width }}>{element.payload.text}</div>;
  return null;
}
