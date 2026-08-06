import { defaultNoteTheme, type ChatResult } from "@/features/notes/note-schema";

export const demoChatResult: ChatResult = {
  answer: "Skill 是一组可复用的任务方法、约束和工具调用规则。",
  mode: "demo",
  note: {
    id: "demo-note",
    question: "什么是 Skill？",
    title: "Skill，就是把好方法变成可重复使用的能力",
    theme: defaultNoteTheme,
    blocks: [
      {
        type: "text",
        id: "definition",
        spans: [
          { id: "definition-lead", text: "Skill 不是一段更长的提示词，而是把" },
          { id: "definition-focus", text: "可复用的方法", emphasis: "strong" },
          { id: "definition-tail", text: "固定成一套能反复执行、反复验证的流程。" },
        ],
        annotations: [{ id: "highlight", type: "highlight", target: { blockId: "definition", spanId: "definition-focus" } }],
      },
      {
        type: "bullet-list",
        id: "points",
        items: [
          { id: "item-1", spans: [{ id: "point-1", text: "输入明确：需要什么信息、有哪些限制。" }] },
          { id: "item-2", spans: [{ id: "point-2", text: "过程稳定：关键步骤和检查点固定下来。" }] },
          { id: "item-3", spans: [{ id: "point-3", text: "结果可验收：输出标准和测试方式清楚。" }] },
        ],
      },
      {
        type: "flow-diagram",
        id: "flow",
        nodes: [{ id: "n1", label: "重复问题" }, { id: "n2", label: "调用方法" }, { id: "n3", label: "稳定结果" }],
        edges: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3" }],
      },
      {
        type: "callout",
        id: "summary",
        tone: "summary",
        spans: [
          { id: "summary-lead", text: "真正值得做成 Skill 的事情，通常都会" },
          { id: "summary-focus", text: "被反复执行，而且结果必须稳定。", emphasis: "strong" },
        ],
        annotations: [{ id: "summary-underline", type: "underline", target: { blockId: "summary", spanId: "summary-focus" } }],
      },
    ],
    arrows: [],
    truncated: false,
  },
};
