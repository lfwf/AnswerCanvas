import { defaultNoteTheme, type NoteDocument } from "@/features/notes/note-schema";
export const validNote: NoteDocument = { id: "note-1", question: "什么是 Skill？", title: "Skill 笔记", theme: defaultNoteTheme, blocks: [
  { type: "text", id: "block-1", spans: [{ id: "span-1", text: "Skill 是可复用的执行方法。", emphasis: "strong" }], annotations: [{ id: "ann-1", type: "highlight", target: { blockId: "block-1", spanId: "span-1" } }] },
  { type: "flow-diagram", id: "block-2", nodes: [{ id: "node-1", label: "输入" }, { id: "node-2", label: "执行" }, { id: "node-3", label: "结果" }], edges: [{ from: "node-1", to: "node-2" }, { from: "node-2", to: "node-3" }] },
], arrows: [], truncated: false };
