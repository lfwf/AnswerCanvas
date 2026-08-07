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

function nextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function PageSnapshotPanel({ scene, ready }: { scene: RecreationScene; ready: boolean }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const generatedSceneRef = useRef<string | null>(null);
  const [snapshots, setSnapshots] = useState<PageSnapshot[]>([]);
  const [state, setState] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [open, setOpen] = useState(false);
  const pages = scene.pages ?? [];

  useEffect(() => {
    if (!ready || !pages.length || generatedSceneRef.current === scene.id) return;
    generatedSceneRef.current = scene.id;
    let cancelled = false;

    const generate = async () => {
      setState("generating");
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
            pixelRatio: 2,
            backgroundColor: scene.paper.background === "transparent" ? "#fbf7ed" : scene.paper.background,
          });
          result.push({ pageId: page.id, title: page.title, dataUrl });
        }
        if (!cancelled) {
          setSnapshots(result);
          setState("ready");
        }
      } catch (error) {
        console.error("Failed to generate page snapshots", error);
        if (!cancelled) setState("error");
      }
    };

    void generate();
    return () => { cancelled = true; };
  }, [pages, ready, scene.id, scene.paper.background]);

  if (!pages.length) return null;

  return <>
    <button className="snapshot-trigger" type="button" onClick={() => setOpen(true)} disabled={state !== "ready"}>
      {state === "generating" ? "生成截图…" : state === "error" ? "截图失败" : state === "ready" ? `最终截图 ${snapshots.length}` : "准备截图"}
    </button>

    <div className="page-snapshot-source" ref={sourceRef} aria-hidden="true">
      {pages.map((page) => <div className="snapshot-capture-page answer-canvas-viewport is-paged-video" data-snapshot-page-id={page.id} key={page.id}>
        <RecreationCanvas scene={scene} completed pageId={page.id} />
      </div>)}
    </div>

    {open && state === "ready" ? <div className="snapshot-modal" role="dialog" aria-modal="true" aria-label="每页最终截图">
      <div className="snapshot-modal-card">
        <header><div><strong>每页最终截图</strong><span>{snapshots.length} 页 · 已按完成态自动生成</span></div><button type="button" onClick={() => setOpen(false)} aria-label="关闭截图面板">×</button></header>
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
