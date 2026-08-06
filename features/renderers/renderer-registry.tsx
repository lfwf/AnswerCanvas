import type { LayoutElement } from "@/features/layout/layout-types";
import { ArrowRenderer } from "./AnnotationLayer";
import { FlowDiagram } from "./FlowDiagram";
import { LineChart } from "./LineChart";
import { QuestionHeader } from "./QuestionHeader";
import { ListRenderer, TextRenderer, TitleRenderer } from "./TextRenderer";

export function renderLayoutElement(element: LayoutElement, progress: Record<string, number>) {
  if (element.kind === "question") return <QuestionHeader key={element.id} element={element} />;
  if (element.kind === "title") return <TitleRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} />;
  if (element.kind === "text" || element.kind === "callout") return <TextRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} targetProgress={progress} />;
  if (element.kind === "bullet-list") return <ListRenderer key={element.id} element={element} progress={progress[`${element.id}:text`] ?? 0} targetProgress={progress} />;
  if (element.kind === "comparison") { const p = progress[`${element.id}:text`] ?? 0; return <section key={element.id} className="comparison handwritten-element" style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height, opacity: p }}><div><h3>{element.payload.left.title}</h3>{element.payload.left.items.map((item) => <p key={item}>{item}</p>)}</div><div><h3>{element.payload.right.title}</h3>{element.payload.right.items.map((item) => <p key={item}>{item}</p>)}</div></section>; }
  if (element.kind === "flow-diagram") return <FlowDiagram key={element.id} element={element} progress={progress} />;
  if (element.kind === "line-chart") return <LineChart key={element.id} element={element} progress={progress} />;
  if (element.kind === "arrow") return <ArrowRenderer key={element.id} element={element} progress={progress[`${element.id}:path`] ?? 0} />;
  if (element.kind === "footer") return <div key={element.id} className="truncated-footer" style={{ left: element.box.x, top: element.box.y, width: element.box.width }}>{element.payload.text}</div>;
  return null;
}
