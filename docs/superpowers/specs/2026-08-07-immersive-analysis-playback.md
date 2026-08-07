# AnswerCanvas 沉浸式分析播放规格

## 目标

为语法、公式、代码、图表、流程和知识拆解场景提供“原内容只出现一次、分析直接叠加在原内容上”的播放模式。播放过程更像跟随老师在同一张纸上逐层分析，而不是不断复制内容生成新的静态笔记块。

## 核心原则

1. **源内容只写一次。** 句子、公式、代码段或核心图形一旦出现，后续分析必须优先锚定到该源元素，不得为了讲解而复制成第二份。
2. **分析原位发生。** 使用 `annotation` 将词性、成分、解释标签绑定到 `targetId + match`，位置由真实字符几何计算，不手猜坐标。
3. **视线可以切换，笔仍然只有一支。** `view` 是展示层淡入淡出，不是第二支笔；它仍占用独立时间轴事件，不与书写/画线事件并发。
4. **聚焦只隐藏干扰，不销毁内容。** `focus` 将非目标动态内容降低透明度，静态纸张结构保持可见。下一阶段可以切换到新的 targetIds。
5. **最终恢复完整笔记。** 教学场景结尾必须安排 `restore`，完整场景和 gallery completed 模式都显示全部笔记内容，不保留临时聚焦状态。
6. **只有必要时新增内容。** 结构公式、翻译、总结、关键点等属于新的知识产物时才新增 text/box；已有句子的词性、从句、语义关系不重复抄写。

## 协议

### annotation

```ts
{
  id: "subject-label",
  kind: "annotation",
  order: 20,
  targetId: "source-sentence",
  match: "I",
  occurrence: 2,
  label: "pron. 主语",
  position: "above",
  color: "#2553a4"
}
```

渲染器根据目标 grapheme 的实际矩形计算标签锚点。annotation 必须晚于目标 text，目标和 match 必须通过 scene validator。

### view

```ts
{
  id: "focus-main-clause",
  kind: "view",
  order: 30,
  mode: "focus",
  targetIds: ["source-sentence", "main-clause-mark", "main-clause-label"],
  dimOpacity: 0.06,
  durationMs: 520
}
```

`restore` 不需要 targetIds。presentation state 只由 scene + progress 推导，`RecreationCanvas` 不持有播放器状态。

## 推荐教学节奏

以长句语法分析为例：

1. 写标题。
2. 写完整原句。
3. focus 原句，画三段从句关系和标签。
4. focus 第一从句，在原句对应单词上写词性标签。
5. focus 主句，继续原位标注。
6. focus 原因从句，继续原位标注。
7. focus “原句 + 结构公式”，新增真正必要的结构总结。
8. focus key points / tip，新增总结知识。
9. restore，全页完整笔记出现。

## 验收

- 源句不存在重复的完整副本。
- annotation 均能解析到真实 target/match。
- focus/restore 的 target ID 均存在。
- view 事件与笔迹事件仍严格串行。
- 静态纸张结构不因 focus 消失。
- completed canvas 忽略临时 focus，显示完整笔记。
- reduced-motion 模式直接呈现完整结果。
