import { chatResultSchema, defaultNoteTheme, type ChatResult } from "./note-schema";

export type IdGenerator = () => string;
const defaultId: IdGenerator = () => crypto.randomUUID();

function createUniqueIdGenerator(idGenerator: IdGenerator): IdGenerator {
  const used = new Set<string>();
  return () => {
    const seed = idGenerator() || defaultId();
    let candidate = seed.slice(0, 120);
    let suffix = 2;
    while (used.has(candidate)) {
      const suffixText = `-${suffix++}`;
      candidate = `${seed.slice(0, 120 - suffixText.length)}${suffixText}`;
    }
    used.add(candidate);
    return candidate;
  };
}

export function createDemoChatResult(question: string, idGenerator: IdGenerator = defaultId): ChatResult {
  const nextId = createUniqueIdGenerator(idGenerator);
  const skillTopic = /(^|\s)skill|技能|能力包/i.test(question);
  const noteId = nextId();
  const ids = Array.from({ length: 18 }, () => nextId());
  const [definitionBlock, definitionSpan, pointsBlock, point1, point1Span, point2, point2Span, point3, point3Span, flowBlock, node1, node2, node3, highlight, calloutBlock, calloutSpan] = ids;
  const answer = skillTopic
    ? "Skill 是一组可复用的任务方法、约束和工具调用规则。它把一次性的提示词，变成可重复执行、可测试、可迭代的工作流程。"
    : `关于“${question}”，可以先从定义、关键要点和实际流程三个层面理解。右侧笔记展示了一个可复用的分析框架。`;
  return chatResultSchema.parse({
    answer,
    mode: "demo",
    note: {
      id: noteId,
      question,
      title: skillTopic ? "Skill：把方法封装成可复用能力" : "问题拆解笔记",
      theme: defaultNoteTheme,
      blocks: [
        { type: "text", id: definitionBlock, spans: [{ id: definitionSpan, text: skillTopic ? "Skill 不是一段更长的提示词，而是一套可复用、可验证的执行方法。" : "先明确概念边界：它是什么、解决什么问题、在什么条件下成立。", emphasis: "strong" }], annotations: [{ id: highlight, type: "highlight", target: { blockId: definitionBlock, spanId: definitionSpan } }] },
        { type: "bullet-list", id: pointsBlock, items: [
          { id: point1, spans: [{ id: point1Span, text: skillTopic ? "输入明确：规定任务所需的上下文和约束。" : "定义：用一句话说明核心概念。" }] },
          { id: point2, spans: [{ id: point2Span, text: skillTopic ? "过程稳定：固定关键步骤、检查点和失败处理。" : "要点：只保留会影响理解和行动的信息。" }] },
          { id: point3, spans: [{ id: point3Span, text: skillTopic ? "输出可验收：给出结构、标准和测试方式。" : "流程：把知识转化为可执行步骤。" }] },
        ] },
        { type: "flow-diagram", id: flowBlock, nodes: [{ id: node1, label: "用户问题" }, { id: node2, label: skillTopic ? "调用 Skill" : "结构化分析" }, { id: node3, label: "稳定结果" }], edges: [{ from: node1, to: node2 }, { from: node2, to: node3 }] },
        { type: "callout", id: calloutBlock, tone: "summary", spans: [{ id: calloutSpan, text: skillTopic ? "判断一个 Skill 是否有价值，看它能否稳定减少重复劳动，而不是看说明写得多长。" : "真正有价值的回答，应让读者更快做出判断或采取行动。" }] },
      ],
      arrows: [],
      truncated: false,
    },
  });
}
