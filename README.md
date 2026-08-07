# AnswerCanvas

AnswerCanvas 是一个 Next.js 图片复刻应用：Codex 读取用户提供的参考图片后，把内容、位置、符号、图形和合理书写顺序写成独立的 `RecreationScene`；应用负责在干净画布上按单一书写队列逐字、逐符号、逐线条呈现。运行时不依赖 AI，也不展示问答历史。

## 运行环境

- Node.js `>=22.12 <26`
- npm `>=10.9`

```bash
npm install
npm run dev
```

打开 `/` 可看到全部复刻场景；每个场景有独立 URL，例如：

- `/scenes/ai-core-concepts`
- `/scenes/skill-agent-notes`

## 给 Codex 一张新图片

后续新增类似手写笔记时，不再修改“当前场景”。直接把图片交给 Codex，并说明“按 AnswerCanvas 规格转成可播放手写场景”。仓库根目录 `AGENTS.md` 会要求 Codex：

1. 先读取 `docs/superpowers/specs/2026-08-07-multi-scene-recreation-design.md`。
2. 理解图片的版面、文字、显式换行、Cue/Notes 关系、颜色、标注和图示，而不是只做 OCR。
3. 在 `features/recreation/scenes/<scene-id>.ts` 新增独立场景，禁止覆盖旧场景。
4. 页面结构设为静态；文字、强调线、箭头、图标和解释图进入唯一动画时间轴。
5. 下划线等优先绑定 `targetId + match`，由真实字符几何计算位置，不手猜坐标。
6. 在 `features/recreation/scenes/index.ts` 注册一次；画廊和 `/scenes/<scene-id>` 路由自动出现。
7. 添加场景结构测试并通过场景验证器；如果缺能力，只扩展通用渲染协议，不为某个 scene ID 写特殊分支。

这套工作流的目标是“Codex 辅助自动建场景”：图片理解和场景代码生成发生在 Codex 侧，AnswerCanvas 本身只负责确定性的渲染、校验与播放。如果未来需要面向最终用户的站内一键上传，还需要再增加图像解析 API/OCR/视觉模型服务层。

## 多场景架构

- `features/recreation/scenes/`：每张参考图片对应一个独立数据场景。
- `features/recreation/scene-registry.ts`：场景注册、canonical ID/alias、安全校验和完整场景验证。
- `features/recreation/RecreationCanvas.tsx`：无状态渲染层；支持任意画布尺寸、plain/ruled/dots 纸张和完成态缩略图。
- `features/recreation/RecreationStage.tsx`：唯一播放器、响应式缩放、暂停/继续/重播/速度控制。
- `features/recreation/SceneGallery.tsx`：完成态场景画廊。
- `features/recreation/hand-drawn-path.ts`：确定性的手绘线条、方框和二次走笔。
- `features/recreation/recreation-geometry.ts`：grapheme/字符盒与语义标注定位。
- `features/recreation/text-placement.ts`：文本坐标微调和可选横线基线吸附。

旧 ID `photo-1-skill-agent-notes` 只作为兼容 alias，永久跳转到规范 ID `skill-agent-notes`。

## 验证

```bash
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run security:scan
```

单元测试覆盖注册表、旧场景迁移、两个场景结构、完成态画布、静态/动态时间轴、语义标注、手绘路径和播放器；Playwright 覆盖画廊、两个独立 URL、旧 ID 308、未知场景 404、静态结构重播保持和移动端横向溢出。

## 已知边界

当前汉字动画是逐字显现，英文和数字逐字符显现；框线和图形按 SVG 手绘路径串行绘制。整个页面严格只有一个活动动画事件，不会从两个区域同时开始。静态图片无法提供原作者真实笔顺，因此复刻的是视觉内容、布局、层级和合理书写顺序，而不是原始笔顺录像。
