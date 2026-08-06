import type { QuestionLayoutElement } from "@/features/layout/layout-types";

export function QuestionHeader({ element }: { element: QuestionLayoutElement }) {
  return (
    <section
      className="question-header"
      aria-label={`用户问题：${element.payload.fullQuestion}`}
      style={{ left: element.box.x, top: element.box.y, width: element.box.width, height: element.box.height }}
      title={element.payload.ellipsized ? element.payload.fullQuestion : undefined}
    >
      {element.payload.lines.map((line, index) => <div key={index}>{line}</div>)}
    </section>
  );
}
