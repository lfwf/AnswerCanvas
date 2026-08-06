import { defaultNoteTheme, type ChatResult } from "@/features/notes/note-schema";
export const demoChatResult: ChatResult = {
  answer: "Skill 是一组可复用的任务方法、约束和工具调用规则。", mode: "demo",
  note: { id: "demo-note", question: "什么是 Skill？", title: "Skill：把方法封装成可复用能力", theme: defaultNoteTheme,
    blocks: [
      { type: "text", id: "definition", spans: [{ id: "definition-span", text: "Skill 不是一段更长的提示词，而是一套可复用、可验证的执行方法。" }], annotations: [{ id: "highlight", type: "highlight", target: { blockId: "definition", spanId: "definition-span" } }] },
      { type: "bullet-list", id: "points", items: [{ id: "item-1", spans: [{ id: "point-1", text: "输入明确" }] }, { id: "item-2", spans: [{ id: "point-2", text: "过程稳定" }] }] },
      { type: "flow-diagram", id: "flow", nodes: [{ id: "n1", label: "问题" }, { id: "n2", label: "Skill" }, { id: "n3", label: "结果" }], edges: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3" }] },
    ], arrows: [], truncated: false,
  },
};
