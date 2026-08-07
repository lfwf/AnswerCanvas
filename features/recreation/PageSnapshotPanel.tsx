/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { RecreationCanvas } from "./RecreationCanvas";
import type { RecreationScene } from "./recreation-types";

interface PageSnapshot {
  pageId: string;
  title: string;
  dataUrl: string;
}

interface SaveResponse {
  ok: boolean;
  directory?: string;
  error?: string;
}

function nextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function PageSnapshotPanel({ scene, ready }: { scene: RecreationScene; ready: boolean }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const generatedRevisionRef = useRef<string | null>(null);
  const [snapshots, setSnapshots] = useState<PageSnapshot[]>([]);
  const [state, setState] = useState<"idle" | "generating" | "saving" | "ready" | "error">("idle");
  const [savedDirectory, setSavedDirectory] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pages = scene.pages ?? [];
  const revisionKey = `${scene.id}:${scene.snapshotRevision ?? "1"}`;
  const shouldRenderSource = ready && (state === "idle" || state === "generating");

  useEffect(() => {
    if (!ready || !pages.length || generatedRevisionRef.current === revisionKey) return;
    generatedRevisionRef.current = revisionKey;
    let cancelled = false;

    const generate = async () => {
      setState("generating");
      setSaveWarning(null);
      setSavedDirectory(null);
      try {
        if (typeof document !== "undefined" && "fonts" in document) await document.fonts.ready;
        await nextPaint();
        const root = sourceRef.current;
        if (!root) throw new Error("snapshot source is unavailable");
        const result: PageSnapshot[] = [];
        for (const page of pages) {
          if (cancelled) return;
          const wrapper = root.querySelector<HTMLElement>(`[data-snapshot-page-id="${page.id}"]`);
          const paper = wrapper?.querySelector<HTMLElement>(".recreation-paper");
          if (!paper) throw new Error(`snapshot page ${page.id} is unavailable`);
          const dataUrl = await toPng(paper, {
            cacheBust: true,
            pixelRatio: 1.25,
            backgroundColor: scene.paper.background === "transparent" ? "#fbf7ed" : scene.paper.background,
          });
          result.push({ pageId: page.id, title: page.title, dataUrl });
        }
        if (cancelled) return;
        setSnapshots(result);
        setState("saving");

        try {
          const response = await fetch("/api/recreation/snapshots", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              sceneId: scene.id,
              revision: scene.snapshotRevision ?? "1",
              pages: result,
            }),
          });
          const payload = await response.json() as SaveResponse;
          if (!response.ok || !payload.ok || !payload.directory) throw new Error(payload.error || "snapshot save failed");
          if (!cancelled) setSavedDirectory(payload.directory);
        } catch (error) {
          const message = error instanceof Error ? error.message : "自动保存失败";
          console.error("Failed to persist page snapshots", error);
          if (!cancelled) setSaveWarning(message);
        }

        if (!cancelled) setState("ready");
      } catch (error) {
        console.error("Failed to generate page snapshots", error);
        if (!cancelled) setState("error");
      }
    };

    void generate();
    return () => { cancelled = true; };
  }, [pages, ready, revisionKey, scene.id, scene.paper.background, scene.snapshotRevision]);

  if (!pages.length) return null;

  const buttonLabel = state === "generating" ? "生成截图…" : state === "saving" ? "保存截图…" : state === "error" ? "截图失败" : state === "ready" ? savedDirectory ? `已保存 ${snapshots.length} 张` : `最终截图 ${snapshots.length}` : "首轮结束后截图";

  return <>
    <button className="snapshot-trigger" type="button" onClick={() => setOpen(true)} disabled={state !== "ready"}>
      {buttonLabel}
    </button>

    {shouldRenderSource ? <div className="page-snapshot-source" ref={sourceRef} aria-hidden="true">
      {pages.map((page) => <div className="snapshot-capture-page answer-canvas-viewport is-paged-video" data-snapshot-page-id={page.id} key={page.id}>
        <RecreationCanvas scene={scene} completed pageId={page.id} />
      </div>)}
    </div> : null}

    {open && state === "ready" ? <div className="snapshot-modal" role="dialog" aria-modal="true" aria-label="每页最终截图">
      <div className="snapshot-modal-card">
        <header>
          <div>
            <strong>每页最终截图</strong>
            <span>{snapshots.length} 页 · 每次首轮完成都会覆盖旧版本</span>
            {savedDirectory ? <code>{savedDirectory}</code> : null}
            {saveWarning ? <em>已生成图片，但自动保存失败：{saveWarning}</em> : null}
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="关闭截图面板">×</button>
        </header>
        <div className="snapshot-grid">
          {snapshots.map((snapshot, index) => <figure key={snapshot.pageId}>
            <img src={snapshot.dataUrl} alt={`${index + 1}. ${snapshot.title}`} />
            <figcaption><span>{index + 1}. {snapshot.title}</span><a href={snapshot.dataUrl} download={`${scene.id}-${String(index + 1).padStart(2, "0")}-${snapshot.pageId}.png`}>下载 PNG</a></figcaption>
          </figure>)}
        </div>
      </div>
    </div> : null}
  </>;
}
