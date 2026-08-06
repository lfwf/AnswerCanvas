# AI Handwritten Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality Next.js MVP where users chat on the left and watch the AI answer render as animated handwritten A4 notes on the right.

**Architecture:** A Next.js App Router monolith keeps the API key server-only. A strict Zod domain schema separates AI generation from deterministic normalization, layout, SVG/HTML rendering, animation, and persistence. The UI consumes one `ChatResult` contract whether the source is OpenAI, demo mode, or fallback mode.

**Tech Stack:** Next.js, React, TypeScript, Zod, OpenAI JavaScript SDK, Vitest, Testing Library, Playwright, CSS Modules/global CSS, native SVG and Web Animations/requestAnimationFrame.

**Runtime baseline:** Node.js `>=22.12 <26` and npm `>=10.9`. The implementation is verified with the workspace runtime Node `25.7.0` and npm `11.10.1`. Application and test dependencies are pinned in `package.json` and `package-lock.json` rather than installed through floating ranges.

---

## File map

```text
app/
  api/chat/route.ts                    HTTP validation and ChatService adapter
  globals.css                          application tokens and responsive shell
  layout.tsx                           metadata and font setup
  page.tsx                             client application entry
features/chat/
  chat-types.ts                        client message/state contracts
  chat-reducer.ts                      request and selection state transitions
  ChatPanel.tsx                        message history, composer, retry UI
  use-chat-session.ts                  API orchestration and persistence bridge
features/notes/
  note-schema.ts                       final strict Zod domain schema and types
  raw-note-schema.ts                   bounded RawAIResult/RawNote boundary for untrusted AI JSON
  normalize-note.ts                    ID/reference normalization and degradation
  demo-note.ts                         deterministic no-key note factory
  fallback-note.ts                     safe plain-text fallback factory
features/layout/
  layout-types.ts                      renderer-facing layout contract
  text-measurer.ts                     injectable text measurement interface
  font-readiness.ts                    font-ready timeout and locked measurement choice
  layout-note.ts                       wrapping, block sizing, pagination
  seeded-random.ts                     deterministic visual jitter
features/handwriting/
  animation-targets.ts                 typed logical-to-DOM/SVG animation target contract
  timeline-types.ts                    animation event contract
  build-timeline.ts                    deterministic event scheduling
  timeline-player.ts                   pause/resume/speed/replay/cancel clock
  use-handwriting-player.ts            React lifecycle adapter
features/paper/
  use-laid-out-note.ts                 font locking and selected-note layout orchestration
  PaperStage.tsx                       pages, scaling, follow-scroll and controls
  PaperPage.tsx                        one A4 page renderer
  paper.css                            paper texture and responsive scaling
features/renderers/
  renderer-registry.tsx                block-kind to renderer mapping
  TextRenderer.tsx                     title/text/list/callout/comparison HTML
  QuestionHeader.tsx                   static first-page user question
  FlowDiagram.tsx                      native SVG flow graph
  LineChart.tsx                        native SVG hand-drawn chart
  AnnotationLayer.tsx                  SVG highlight/circle/line/arrow layer
  PenCursor.tsx                        active pen indicator
features/persistence/
  session-storage.ts                   versioned localStorage envelope and limits
lib/ai/
  chat-service.ts                      demo/OpenAI/fallback policy
  openai-note-generator.ts             server-only structured output call
  prompt.ts                            system prompt and schema instructions
tests/
  fixtures/notes.ts                    valid and invalid domain fixtures
  fixtures/chat-results.ts             API and browser result fixtures
  setup.ts                             DOM/test polyfills
scripts/
  assert-no-secret.mjs                 scans build/test artifacts for sentinel keys
e2e/
  handwritten-notes.spec.ts            desktop/mobile user journeys
```

## Task 1: Scaffold the application and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `eslint.config.mjs`
- Create: `tests/setup.ts`
- Create: `app/page.test.tsx`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create the pinned package manifest and configuration**

Set `engines.node` to `>=22.12 <26`. Use scripts `dev`, `build`, `lint`, `test`, `test:watch`, `test:e2e`, and `security:scan`. Pin runtime dependencies to `next@16.3.0`, `react@19.2.8`, `react-dom@19.2.8`, `zod@4.4.3`, and `openai@7.4.0`. Pin dev dependencies to `typescript@7.0.2`, `eslint@10.8.0`, `eslint-config-next@16.3.0`, `vitest@4.1.10`, `jsdom@30.0.1`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@7.0.0`, `@testing-library/user-event@14.6.3`, `@playwright/test@1.62.1`, `@types/node@26.1.2`, `@types/react@19.2.18`, and `@types/react-dom@19.2.4`.

- [ ] **Step 2: Install dependencies and browser runtime**

Run: `npm install`

Expected: creates `package-lock.json` with no unresolved dependency errors.

Run: `npx playwright install chromium`

Expected: exits 0 with Chromium available to Playwright.

- [ ] **Step 3: Add a failing smoke test**

Create `app/page.test.tsx` asserting that the page exposes the heading “把 AI 回答写在纸上” and a textbox named “输入你的问题”.

- [ ] **Step 4: Run the smoke test and verify RED**

Run: `npm test -- app/page.test.tsx`

Expected: FAIL because `app/page.tsx` does not yet expose the product shell.

- [ ] **Step 5: Implement the smallest server/client shell and flat ESLint config**

Add metadata, import global CSS, and render the heading plus labelled textarea. Keep the page free of note logic.

- [ ] **Step 6: Run quality checks and verify GREEN**

Run separately, stopping on the first failure:

```powershell
npm test -- app/page.test.tsx
npm run lint
npm run build
```

Expected: all commands pass; build produces the root route.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts playwright.config.ts eslint.config.mjs tests/setup.ts app .env.example .gitignore
git commit -m "chore: scaffold handwritten notes app"
```

## Task 2: Implement the strict note schema and demo result

**Files:**
- Create: `features/notes/note-schema.ts`
- Create: `features/notes/demo-note.ts`
- Create: `lib/text/graphemes.ts`
- Create: `tests/fixtures/notes.ts`
- Test: `lib/text/graphemes.test.ts`
- Test: `features/notes/note-schema.test.ts`
- Test: `features/notes/demo-note.test.ts`

- [ ] **Step 1: Write failing grapheme tests**

Cover Chinese, combining marks, emoji skin tones, and ZWJ sequences through one exported `splitGraphemes`/`countGraphemes` utility.

- [ ] **Step 2a: Verify grapheme RED**

Run before implementation: `npm test -- lib/text/graphemes.test.ts`

Expected: FAIL because the module is missing.

- [ ] **Step 2b: Implement the shared grapheme utility**

Prefer `Intl.Segmenter`; add a tested fallback for environments without it. Export only `splitGraphemes` and `countGraphemes`.

- [ ] **Step 2c: Verify grapheme GREEN**

Run after implementation: `npm test -- lib/text/graphemes.test.ts`

Expected: PASS. All later schema and layout code must import this module; do not create a second segmenter.

- [ ] **Step 3: Write failing schema tests**

Cover every discriminator, exact theme literals, required 1–4,000-grapheme `question`, strict unknown-field rejection, grapheme limits, chart label/point cardinality, finite numbers, annotation ownership, same-block text targets, document-level arrows, total visible text, and required `truncated`.

Representative assertion:

```ts
expect(() => noteDocumentSchema.parse({ ...validNote, extra: true })).toThrow();
expect(() => noteDocumentSchema.parse(chartWithMismatchedPoints)).toThrow();
```

- [ ] **Step 4: Run schema tests and verify RED**

Run: `npm test -- features/notes/note-schema.test.ts`

Expected: FAIL because the schema module does not exist.

- [ ] **Step 5: Implement strict Zod schemas and inferred TypeScript types**

Export `chatResultSchema`, `noteDocumentSchema`, every block schema, and inferred types. Put grapheme-aware string refinements behind a small helper instead of JavaScript `.length`.

- [ ] **Step 6: Run schema tests and verify GREEN**

Run: `npm test -- features/notes/note-schema.test.ts`

Expected: PASS.

- [ ] **Step 7: Write a failing demo-note test**

Assert that `createDemoChatResult("什么是 Skill？")` returns `mode: "demo"`, preserves the exact string as `note.question`, contains at least two text/list blocks, one highlight, and a valid three-node flow diagram. Assert identical input yields structurally identical content except a supplied ID generator.

- [ ] **Step 8: Implement the deterministic demo factory**

Accept an injectable ID generator. Include a general definition/points/flow template for arbitrary questions and a richer Skill-specific template.

- [ ] **Step 9: Run tests and commit**

Run: `npm test -- features/notes`

Expected: PASS.

```bash
git add features/notes lib/text tests/fixtures
git commit -m "feat: define note schema and demo content"
```

## Task 3: Normalize unsafe AI notes and build fallback notes

**Files:**
- Create: `features/notes/normalize-note.ts`
- Create: `features/notes/raw-note-schema.ts`
- Create: `features/notes/fallback-note.ts`
- Test: `features/notes/normalize-note.test.ts`
- Test: `features/notes/raw-note-schema.test.ts`
- Test: `features/notes/fallback-note.test.ts`

- [ ] **Step 1: Write failing raw-boundary tests**

Define `RawAIResult` as `{ answer, note }`. `answer` must be a bounded 1–6,000-grapheme string. Its `note` is a `RawNoteDocument`: known blocks may omit IDs or contain invalid references, and unknown block discriminators are retained as bounded records for conversion. Reject non-object roots, excessive nesting/arrays/strings, and prototype-pollution keys.

- [ ] **Step 2a: Verify raw-boundary RED**

Run before implementation: `npm test -- features/notes/raw-note-schema.test.ts`

Expected: FAIL because the raw boundary is missing.

- [ ] **Step 2b: Implement the bounded raw parser**

Return diagnostics with the bounded raw document; do not call the final strict parser in this module.

- [ ] **Step 2c: Verify raw-boundary GREEN**

Run after implementation: `npm test -- features/notes/raw-note-schema.test.ts`

Expected: PASS. The ownership pipeline is explicit: `openai-note-generator` returns `unknown`; `raw-note-schema` parses one bounded `RawAIResult` while discarding any AI-supplied question; `normalizeNote(raw.note, validatedQuestion)` repairs the note, injects the server-validated question, and performs the final `noteDocumentSchema` parse; `chat-service` combines `raw.answer` with that strict note and performs the final `chatResultSchema` parse. If note normalization fails but `raw.answer` is valid, fallback `safeText` is `raw.answer`; if transport/raw parsing fails before a safe answer exists, use “暂时无法生成完整笔记，请重试”。

- [ ] **Step 3: Write failing normalization tests**

Test deterministic canonical IDs, exact injection of the validated question before strict parsing, AI-supplied question discard, unique-reference rewriting, ambiguous duplicate-reference removal, invalid annotation removal, zero-edge flow conversion to text, unknown block conversion, cross-block text annotation rejection, and `truncated` propagation.

- [ ] **Step 4: Verify RED**

Run: `npm test -- features/notes/normalize-note.test.ts`

Expected: FAIL because `normalizeNote` is missing.

- [ ] **Step 5: Implement a two-pass normalizer**

Accept `validatedQuestion` as a required argument. Pass one counts raw IDs and generates canonical positional IDs. Pass two resolves only unique mappings, drops ambiguous references with diagnostics, converts invalid graphs, enforces the 9,000-grapheme AI-content cap excluding question, injects the exact validated question, and returns `{ note, diagnostics }` validated once by `noteDocumentSchema`.

- [ ] **Step 6: Write the failing fallback test**

Assert HTML-looking text remains inert text, output always passes `chatResultSchema`, and fallback IDs are injected.

- [ ] **Step 7a: Implement the safe fallback**

Implement `createFallbackChatResult(question, safeText, idGenerator)` with one valid text block and no HTML interpretation.

- [ ] **Step 7b: Verify fallback GREEN**

Run: `npm test -- features/notes/fallback-note.test.ts`

Expected: PASS.

- [ ] **Step 8: Run tests and commit**

Run: `npm test -- features/notes`

Expected: PASS.

```bash
git add features/notes
git commit -m "feat: normalize generated notes safely"
```

## Task 4: Build deterministic jitter, font measurement, wrapping, and pagination

**Files:**
- Create: `features/layout/seeded-random.ts`
- Create: `features/layout/text-measurer.ts`
- Create: `features/layout/font-readiness.ts`
- Create: `features/layout/layout-types.ts`
- Create: `features/layout/layout-note.ts`
- Test: `features/layout/font-readiness.test.ts`
- Test: `features/layout/seeded-random.test.ts`
- Test: `features/layout/layout-note.test.ts`

- [ ] **Step 1: Write failing seed tests**

Cover stable seeds and different document IDs producing different jitter. Import grapheme logic from `lib/text/graphemes.ts` rather than duplicating it in layout.

- [ ] **Step 2a: Verify seeded-random RED**

Run: `npm test -- features/layout/seeded-random.test.ts`

Expected: FAIL because the utility is missing.

- [ ] **Step 2b: Implement the minimal seeded-random utility**

Expose deterministic number and range helpers; do not add layout behavior.

- [ ] **Step 2c: Verify seeded-random GREEN**

Run: `npm test -- features/layout/seeded-random.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing font-readiness tests**

Use fake timers and a fake `FontFaceSet`. Assert layout waits for ready, switches to the fallback measurer at exactly three seconds, locks that choice, and ignores a later font-ready resolution.

- [ ] **Step 4a: Verify font-readiness RED**

Run before implementation: `npm test -- features/layout/font-readiness.test.ts`

Expected: FAIL because `selectLockedTextMeasurer` is missing.

- [ ] **Step 4b: Implement `selectLockedTextMeasurer`**

Race font readiness against an injected three-second timer and permanently lock the winning measurer.

- [ ] **Step 4c: Verify font-readiness GREEN**

Run: `npm test -- features/layout/font-readiness.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing layout tests with an injected fixed-width measurer**

Assert full rectangle bounds, Chinese/English wrapping, static question placement, three-line question ellipsis without mutating `NoteDocument.question`, no question repetition on page two, at-least-two-lines rule, text/list splitting, comparison splitting, diagram scale-down, oversized diagram text degradation, truncation footer metadata, and no lost input lines across pages.

```ts
for (const element of result.pages.flatMap((page) => page.elements)) {
  expect(element.box.x).toBeGreaterThanOrEqual(64);
  expect(element.box.x + element.box.width).toBeLessThanOrEqual(730);
  expect(element.box.y).toBeGreaterThanOrEqual(64);
  expect(element.box.y + element.box.height).toBeLessThanOrEqual(1059);
}
```

- [ ] **Step 6: Verify layout RED**

Run: `npm test -- features/layout/layout-note.test.ts`

Expected: FAIL because `layoutNote` is missing.

- [ ] **Step 7: Implement the layout contract and pagination**

Use logical `794x1123`, margin 64, line height 38. Create a unique static first-page question element before all blocks; wrap it to at most three lines with an ellipsis and never repeat it on later pages. Return typed layout payloads; never import React or renderer components. Resolve same-page document arrows after pagination and emit diagnostics for dropped cross-page arrows.

- [ ] **Step 8: Run tests and commit**

Run: `npm test -- features/layout`

Expected: PASS.

```bash
git add features/layout
git commit -m "feat: add deterministic A4 layout engine"
```

## Task 5: Build the animation timeline and controllable player

**Files:**
- Create: `features/handwriting/animation-targets.ts`
- Create: `features/handwriting/timeline-types.ts`
- Create: `features/handwriting/build-timeline.ts`
- Create: `features/handwriting/timeline-player.ts`
- Create: `features/handwriting/use-handwriting-player.ts`
- Test: `features/handwriting/build-timeline.test.ts`
- Test: `features/handwriting/timeline-player.test.ts`
- Test: `features/handwriting/animation-targets.test.ts`

- [ ] **Step 1: Write failing animation-target contract tests**

Define typed target descriptors for text reveal, path draw, marker sweep, underline, circle, strike, arrow, and pen-follow anchor. Assert every layout payload maps to a stable target ID and that unknown target kinds fail closed.

- [ ] **Step 2a: Verify animation-target RED**

Run before implementation: `npm test -- features/handwriting/animation-targets.test.ts`

Expected: FAIL because the target contract is missing.

- [ ] **Step 2b: Implement typed animation-target descriptors**

Keep descriptors free of DOM nodes so schedule creation remains testable outside React.

- [ ] **Step 2c: Verify animation-target GREEN**

Run: `npm test -- features/handwriting/animation-targets.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing schedule tests**

Assert the static question element is excluded from events and the answer title is the first animation event. Also assert ordering by page/element/phase/stable ID, 45ms per grapheme, path duration clamped to 300–2500ms, and 120ms pauses.

- [ ] **Step 4a: Verify timeline-builder RED**

Run: `npm test -- features/handwriting/build-timeline.test.ts`

Expected: FAIL because `buildTimeline` is missing.

- [ ] **Step 4b: Implement `buildTimeline`**

Build stable events from layout elements and typed target descriptors only.

- [ ] **Step 4c: Verify timeline-builder GREEN**

Run: `npm test -- features/handwriting/build-timeline.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing fake-clock player tests**

Test pause position, resume, immediate speed changes, `duration2x / duration1x` between 0.48 and 0.52, replay reset, cancellation, exactly one `onPageFollow(page)` call per newly active page, and manual-scroll suppression.

- [ ] **Step 6: Implement a dependency-injected player clock**

The core player takes `now`, `requestFrame`, and `cancelFrame` functions. Keep React lifecycle in `use-handwriting-player.ts`, which cancels on note change/unmount.

- [ ] **Step 7: Run tests and commit**

Run: `npm test -- features/handwriting`

Expected: PASS.

```bash
git add features/handwriting
git commit -m "feat: add handwritten animation timeline"
```

## Task 6: Render the A4 pages, text, diagrams, annotations, and pen

**Files:**
- Create: `features/renderers/renderer-registry.tsx`
- Create: `features/renderers/TextRenderer.tsx`
- Create: `features/renderers/QuestionHeader.tsx`
- Create: `features/renderers/FlowDiagram.tsx`
- Create: `features/renderers/LineChart.tsx`
- Create: `features/renderers/AnnotationLayer.tsx`
- Create: `features/renderers/PenCursor.tsx`
- Create: `features/paper/PaperPage.tsx`
- Create: `features/paper/PaperStage.tsx`
- Create: `features/paper/use-laid-out-note.ts`
- Create: `features/paper/paper.css`
- Test: `features/renderers/renderer-registry.test.tsx`
- Test: `features/renderers/TextRenderer.test.tsx`
- Test: `features/renderers/QuestionHeader.test.tsx`
- Test: `features/renderers/FlowDiagram.test.tsx`
- Test: `features/renderers/LineChart.test.tsx`
- Test: `features/renderers/AnnotationLayer.test.tsx`
- Test: `features/renderers/PenCursor.test.tsx`
- Test: `features/paper/PaperPage.test.tsx`
- Test: `features/paper/PaperStage.test.tsx`
- Test: `features/paper/use-laid-out-note.test.tsx`
- Test: `features/paper/PaperStage.integration.test.tsx`

- [ ] **Step 1: Write failing note-layout orchestration tests**

For `useLaidOutNote`, inject font readiness, primary/fallback measurers, and `layoutNote`. Assert it waits for the locked measurer, invokes layout once for the selected note, cancels an obsolete pending selection, and does not re-layout when the primary font resolves after the three-second fallback lock.

- [ ] **Step 2a: Verify orchestration RED**

Run: `npm test -- features/paper/use-laid-out-note.test.tsx`

Expected: FAIL because the orchestration hook is missing.

- [ ] **Step 2b: Implement the focused layout hook**

Use a generation token or AbortController so only the current selected note may publish a layout result.

- [ ] **Step 2c: Verify orchestration GREEN**

Run: `npm test -- features/paper/use-laid-out-note.test.tsx`

Expected: PASS.

- [ ] **Step 3: Write failing renderer component tests**

Assert registry dispatch, semantic text, deterministic jitter CSS variables, immediately visible first-page `Q：` question styling and static blue underline, SVG flow edges, chart paths, highlight/circle/underline/strike/arrow markup, hidden/revealed states, pen position, and unsupported-kind text fallback.

- [ ] **Step 4: Verify renderer RED**

Run: `npm test -- features/renderers features/paper`

Expected: FAIL because renderers do not exist.

- [ ] **Step 5: Implement HTML text and native SVG renderers**

Use no `dangerouslySetInnerHTML`. Each renderer registers its actual DOM/SVG node against the typed descriptor from `animation-targets.ts`. Path targets expose measured length and use `stroke-dasharray`/`stroke-dashoffset`; text targets expose a reveal fraction; marker and underline targets expose sweep progress. Use viewBox coordinates from layout, round linecaps, uneven duplicate strokes, and the approved blue/green/yellow palette.

- [ ] **Step 6: Write the failing renderer/timeline integration test**

Mount a selected note through `PaperStage`, not a precomputed page. Include the user question, text, highlight, underline, strike, circle, arrow, flow edge, and chart path. Before advancing the clock, assert the question is visible and absent from the target registry; then assert the answer title is the first active target, every animated target progresses, `stroke-dashoffset` reaches zero, text reveals, the pen follows the active target, and completion emits exactly once. Replay must leave the question visible. Resolve the real font late and assert the mounted note is not laid out again.

- [ ] **Step 7: Verify integration RED**

Run: `npm test -- features/paper/PaperStage.integration.test.tsx`

Expected: FAIL before `PaperStage` binds the player to registered targets.

- [ ] **Step 8: Implement the paper stage and controls**

Own note-to-layout orchestration through `useLaidOutNote`, then render warm-white A4 pages, subtle texture, shadow, page stack, pause/resume/replay controls, speed selector, current page indicator, and reduced-motion completed state. Bind the logical timeline to the target registry and dispatch `handwriting:page-follow` from the follow callback.

- [ ] **Step 9: Run component and integration tests and commit**

Run: `npm test -- features/renderers features/paper`

Expected: PASS.

```bash
git add features/renderers features/paper
git commit -m "feat: render animated handwritten paper"
```

## Task 7: Add versioned local persistence and chat state transitions

**Files:**
- Create: `features/persistence/session-storage.ts`
- Create: `features/chat/chat-types.ts`
- Create: `features/chat/chat-reducer.ts`
- Test: `features/persistence/session-storage.test.ts`
- Test: `features/chat/chat-reducer.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Cover valid restore with the complete unellipsized `note.question`, corrupt JSON, unknown version, schema-invalid note, UUID collision first-wins policy, 20-turn eviction, UTF-8 `TextEncoder` 2MB calculation, too-large newest turn memory-only result, unavailable storage, and quota errors. Assert a save/load round trip preserves every grapheme of question exactly.

- [ ] **Step 2a: Verify persistence RED**

Run: `npm test -- features/persistence/session-storage.test.ts`

Expected: FAIL because persistence functions are missing.

- [ ] **Step 2b: Implement versioned persistence**

Keep all storage access behind an injected `Storage`-like interface and return non-blocking warnings as data.

- [ ] **Step 2c: Verify persistence GREEN**

Run: `npm test -- features/persistence/session-storage.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing reducer tests**

Cover submitting/success/error, requestId matching, stale response isolation, selection not stolen by late responses, retry in place, attempt increments, and prior successful paper retention.

- [ ] **Step 4a: Implement the pure reducer**

Reject mismatched request IDs and keep selected message state independent from response arrival.

- [ ] **Step 4b: Verify reducer GREEN**

Run: `npm test -- features/chat/chat-reducer.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/persistence features/chat/chat-types.ts features/chat/chat-reducer.ts
git commit -m "feat: persist chat sessions safely"
```

## Task 8: Implement the server-only OpenAI adapter and API route

**Files:**
- Create: `lib/ai/prompt.ts`
- Create: `lib/ai/openai-note-generator.ts`
- Create: `lib/ai/chat-service.ts`
- Create: `app/api/chat/route.ts`
- Test: `lib/ai/chat-service.test.ts`
- Test: `lib/ai/openai-note-generator.test.ts`
- Test: `app/api/chat/route.test.ts`

- [ ] **Step 1: Write failing ChatService policy tests**

Inject the generator and logger. Assert no generator call without `OPENAI_API_KEY`, demo mode for arbitrary prompts, OpenAI and fallback results preserving the exact validated request question, AI-supplied question being ignored, `RawAIResult.answer` plus normalized note becoming one strict `ChatResult`, valid raw answer supplying fallback `safeText`, generic fallback text when no safe answer exists, one repair attempt, timeout mapping, and no sentinel secret in returned or logged objects.

- [ ] **Step 2: Verify RED**

Run: `npm test -- lib/ai/chat-service.test.ts`

Expected: FAIL because the service is missing.

- [ ] **Step 3: Write failing OpenAI cancellation tests**

Use fake timers and an injected SDK client. Assert the caller request signal aborts the SDK call, the 30-second timeout aborts it independently, and whichever signal fires first removes the other listener. Verify repair receives only invalid JSON plus validation diagnostics.

- [ ] **Step 4: Implement the service and OpenAI adapter**

Keep `import "server-only"` in the OpenAI module. Use the installed SDK's current structured-output API to request the full raw result without a question field, then pass `unknown -> RawAIResult (discard AI question) -> normalizeNote(raw.note, validatedQuestion) -> noteDocumentSchema -> combine raw.answer -> chatResultSchema`. Compose the request AbortSignal with a 30-second timeout signal. The model name comes from `OPENAI_MODEL`, with a documented default.

- [ ] **Step 5: Write failing route tests**

Test empty input, exactly 4,000 graphemes, 4,001 graphemes, success as `{ data }`, upstream errors as 502, timeout as 504, `retryable` flags, and propagation of `request.signal` into ChatService.

- [ ] **Step 6a: Implement the Route Handler**

Parse the request body, count graphemes through the shared utility, pass `request.signal` to ChatService, and map typed service failures to the specified HTTP envelope.

- [ ] **Step 6b: Verify route and service GREEN**

Run: `npm test -- lib/ai app/api/chat/route.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/ai app/api/chat
git commit -m "feat: add structured AI chat endpoint"
```

## Task 9: Connect the chat UI to the paper stage

**Files:**
- Create: `features/chat/ChatPanel.tsx`
- Create: `features/chat/use-chat-session.ts`
- Test: `features/chat/ChatPanel.test.tsx`
- Test: `features/chat/use-chat-session.test.tsx`
- Test: `app/page.integration.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write failing chat UI tests**

Test labelled input, submit/loading, right-pane “正在整理笔记…” state, left-side answer, demo badge, selected-message error card, retry in the same message slot, history selection, restored history, persistence warning, and keyboard submit behavior.

- [ ] **Step 2: Write failing orchestration tests**

Mock fetch only at the HTTP boundary. Resolve two requests out of order and assert each updates its own message while the current paper selection remains unchanged. Unmount or replace an active retry and assert its client `AbortController` aborts fetch.

- [ ] **Step 3: Verify RED**

Run: `npm test -- features/chat app/page.test.tsx app/page.integration.test.tsx`

Expected: FAIL because the connected UI is absent.

- [ ] **Step 4: Implement the hook, panel, and split-shell page**

Keep network orchestration in the hook, state transitions in the reducer, persistence in its module, and rendering in components. Wire loading and selected-error states into the right pane. At `>=1024px`, chat and paper are independent columns; below it they stack. Disable only the active submit control, not history navigation.

- [ ] **Step 5: Run component tests and commit**

Run: `npm test -- features/chat app/page.test.tsx app/page.integration.test.tsx`

Expected: PASS.

```bash
git add features/chat app/page.tsx app/globals.css
git commit -m "feat: connect chat and handwritten paper"
```

## Task 10: Add end-to-end coverage and finish visual polish

**Files:**
- Create: `e2e/handwritten-notes.spec.ts`
- Create: `tests/fixtures/chat-results.ts`
- Create: `scripts/assert-no-secret.mjs`
- Modify: `playwright.config.ts`
- Modify: `features/paper/paper.css`
- Modify: `app/globals.css`
- Create: `README.md`

- [ ] **Step 1: Write the failing desktop demo E2E test**

At 1440x900, submit “什么是 Skill？”, assert the UI reports demo mode, `Q：什么是 Skill？` is immediately visible before playback advances, and the right paper later contains title/highlight/three-node flow. Assert replay leaves the question visible and reload restores history. Add a long-question fixture that renders exactly three question lines with an ellipsis and a multi-page fixture that shows the question only on page one. The no-generator-call assertion remains in ChatService unit tests because a browser cannot observe an internal server-side SDK call.

- [ ] **Step 2: Write the failing mobile and accessibility tests**

At 390x844, assert stacked layout and no document-level horizontal overflow. Emulate reduced motion, assert the paper starts complete without pen movement, then replay and assert fade-in is used instead of path motion. Verify manual scroll suppresses follow for three seconds. Count `handwriting:page-follow` events in a deterministic multi-page fixture.

- [ ] **Step 3: Make E2E fixtures deterministic**

Use `page.route("**/api/chat")` to return checked-in valid, multi-page, and retryable-timeout `ChatResult` fixtures. Use `page.addInitScript` with a schema-valid version-1 storage envelope for reload/history cases. Valid/repair/timeout SDK behavior remains covered by Task 8 unit tests; Playwright only verifies browser behavior for the resulting HTTP contracts.

- [ ] **Step 4: Run E2E and verify RED**

Run: `npm run test:e2e`

Expected: at least one assertion fails before final selectors/styles are complete.

- [ ] **Step 5: Write the failing sentinel scanner fixture**

Create a temporary fixture directory containing the sentinel and assert `node scripts/assert-no-secret.mjs sk-sentinel-do-not-ship <fixture>` exits nonzero. Do not place a deliberately secret-bearing file in real build or test output. API payload, injected logger, localStorage, and snapshot sentinel assertions remain in their owning tests.

- [ ] **Step 6: Implement the scanner and prove the real client bundle is clean**

Implement binary-safe recursive scanning. Run these exact PowerShell commands:

```powershell
$env:OPENAI_API_KEY = 'sk-sentinel-do-not-ship'
npm run build
Remove-Item Env:OPENAI_API_KEY
node scripts/assert-no-secret.mjs sk-sentinel-do-not-ship .next/static
```

Expected: the deliberate fixture test fails when the sentinel is present; the real `.next/static` scan passes. Do not scan `.next/server`, because the acceptance boundary here is the browser bundle.

- [ ] **Step 7: Apply one failing visual/integration assertion at a time**

For each failing E2E assertion, make the minimal CSS/component change, rerun that named Playwright test, and keep it green before moving to the next assertion.

Match the approved reference: warm paper, black handwritten text, yellow marker, blue/green diagrams, restrained controls, readable contrast, stable focus states, and no page overflow.

- [ ] **Step 8: Document setup**

README must include Node prerequisites, `npm install`, demo-mode `npm run dev`, optional `OPENAI_API_KEY`/`OPENAI_MODEL`, test commands, the non-real-stroke limitation, and architecture directory map.

- [ ] **Step 9: Run the complete verification suite**

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
node scripts/assert-no-secret.mjs sk-sentinel-do-not-ship .next/static
```

Expected: all pass without errors or warnings attributable to the app.

- [ ] **Step 10: Commit**

```bash
git add e2e tests/fixtures/chat-results.ts scripts/assert-no-secret.mjs playwright.config.ts features/paper/paper.css app/globals.css README.md
git commit -m "test: verify handwritten notes experience"
```

## Final verification

- [ ] Use `superpowers:verification-before-completion` before claiming completion.
- [ ] Use `superpowers:requesting-code-review` for a final requirements and quality review.
- [ ] Confirm `git status --short` is clean except for explicitly acknowledged user files.
- [ ] Report demo start command and the exact environment variables needed for OpenAI mode.
