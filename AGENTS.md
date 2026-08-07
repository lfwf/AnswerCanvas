# AnswerCanvas Codex Instructions

## Image-to-handwritten recreation workflow

When the user uploads a notebook/reference image and asks to “转成手写”, “复刻”, “做成可播放手写版本”, or equivalent:

1. **Never overwrite an existing scene.** Existing scenes are historical outputs and must stay reproducible.
2. Read `docs/superpowers/specs/2026-08-07-multi-scene-recreation-design.md` before editing. If the task is a learning/analysis walkthrough (grammar, formula, code, chart, process, etc.), also read `docs/superpowers/specs/2026-08-07-immersive-analysis-playback.md`.
3. Inspect the image semantically, not only with OCR. Identify page structure, text blocks, explicit line breaks, Cue/Notes relationships, annotations, boxes, arrows, diagrams, colors, and a plausible human writing order.
4. Create one new file under `features/recreation/scenes/<scene-id>.ts`. Use a canonical lowercase kebab-case scene ID and preserve the source image aspect ratio in `width`/`height`.
5. Give every new scene a concise `prompt` that reads like the user's original request. The scene page renders this prompt as the user message above the handwritten answer, while `title` remains the short history label.
6. Rebuild the image with HTML text and SVG geometry. **Do not use the source image as the page background.** Use authored scene coordinates rather than browser auto-layout for source-critical placement.
7. Put permanent page structure (page border, column dividers, section separators, paper pattern) in elements with `animated: false` and no `order`.
8. Put text, annotations, arrows, icons, explanatory diagrams and other pen-created content on the single animation timeline. Dynamic `order` values must be finite, non-negative and unique in the scene.
9. A single virtual pen is the invariant: no two pen-created dynamic elements may intentionally animate concurrently. Preserve explicit source-image line breaks. On ruled paper, use `snapToRule: true` only when the source text is actually aligned to those rules; otherwise preserve authored coordinates. For underlines/highlights/circles, prefer semantic `targetId + match` marks so geometry is derived from rendered characters rather than guessed x/y values.
10. **For learning/analysis scenes, do not rewrite source content just to explain it.** If a sentence, formula, paragraph or diagram already exists, keep it in place and attach `annotation` elements to the original target. Use `view` effects to temporarily fade unrelated content, walk through one logical layer at a time, then finish with a `restore` effect so the complete note is visible again. View effects are presentation transitions, not a second pen, and still occupy their own sequential timeline event.
11. Prefer normal line/box primitives and let the shared hand-drawn renderer add deterministic roughness. Use custom SVG paths for diagrams or irregular icons. Do not add scene-ID conditionals to `RecreationCanvas` or `RecreationStage`.
12. Register the scene once in `features/recreation/scenes/index.ts`. The history sidebar, gallery and `/scenes/<scene-id>` route should then appear automatically.
13. Add a scene structure test asserting the key content groups, diagrams, anchored annotations and intended focus/restore choreography. Run scene validation and ensure no duplicate element IDs/orders, missing annotation/mark targets, invalid mark order or out-of-bounds boxes.
14. Compare the finished canvas against the reference at both full-page and detail level. Fix geometry/content errors in the new scene only. Do not change another scene to make the new image fit. If a missing capability is genuinely generic, extend the shared scene protocol/renderer with tests first, then use it from the new scene.

## Recreation architecture invariants

- `RecreationCanvas` is rendering-only. It must not create a player, timer, `ResizeObserver`, toolbar or global state.
- `RecreationStage` owns the simulated conversation shell, playback and responsive viewport scaling.
- The left history list comes from the registered scene list; handwritten scene data must not hard-code navigation UI.
- The user prompt is ordinary UI and is immediately visible. Only the handwritten assistant answer participates in the pen/presentation timeline.
- Static scene elements always render at progress `1`; replay/reset only clears dynamic progress.
- `annotation` elements anchor explanatory labels to an existing text range; they must not duplicate the source sentence as a second text block.
- `view` elements only control presentation opacity. Static paper structure stays visible, focus transitions must be deterministic, and completed thumbnails ignore temporary focus so they always show the full note.
- Scene routing is canonical and isolated by canonical scene ID. Old player callbacks must never update a newly mounted scene.
- `scene-registry.ts` is the authority for canonical IDs, aliases and validation.
- Unknown/unsafe scene IDs must resolve to 404. The legacy `photo-1-skill-agent-notes` alias permanently redirects to `skill-agent-notes`.
