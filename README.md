# AnswerCanvas

AnswerCanvas 是一个 Next.js 单体应用：Codex 读取用户提供的参考图片后，把内容、位置、符号和书写顺序写入复刻场景；应用只负责在一张干净的纸上按单一书写队列逐字、逐符号、逐线条呈现。运行时不调用 AI，也不展示问答历史。

## 运行环境

- Node.js `>=22.12 <26`
- npm `>=10.9`

```bash
npm install
npm run dev
```

当前示例场景位于 `features/recreation/current-scene.ts`。使用方式：把图片发给 Codex，并说明“转成手写”；Codex 更新该场景后，刷新应用即可播放新的复刻结果。

## 验证

```bash
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run security:scan
```

## 架构

- `features/notes`：严格 Zod 领域协议、演示数据、AI 边界解析与规范化。
- `features/layout`：字体度量、换行、A4 分页与稳定坐标。
- `features/renderers`：HTML/SVG 渲染器注册表。
- `features/handwriting`：动画目标、时间轴和可控制播放器。
- `features/paper`：纸张缩放、页面播放和跟随滚动。
- `features/recreation`：图片复刻场景、单队列书写播放器和当前示例页面。
- `features/chat`：纯 reducer、请求编排和聊天 UI。
- `features/persistence`：版本化 localStorage 与容量控制。

## 已知边界

当前汉字动画是逐字显现，英文和数字是逐字符显现，Emoji、编号、圈线和框线作为单个书写单元；整个页面严格只有一个活动单元，不会从两个区域同时开始。静态图片无法提供原作者真实笔顺，因此复刻的是视觉内容、布局、层级和合理书写顺序，而不是原始笔顺录像。
