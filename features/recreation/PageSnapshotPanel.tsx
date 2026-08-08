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

function delay(durationMs: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));
}

function withTimeout<T>(promise: Promise<T>, durationMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), durationMs);
    promise.then((value) => {
      window.clearTimeout(timer);
      resolve(value);
    }, (error) => {
      window.clearTimeout(timer);
      reject(error);
    });
  });
}

async function waitForFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await Promise.race([
    document.fonts.ready.then(() => undefined).catch(() => undefined),
    delay(2500),
  ]);
}

export function PageSnapshotPanel({ scene, ready }: { scene: RecreationScene; ready: boolean }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const generatedRevisionRef = useRef<string | null>(null);
  const [snapshots, setSnapshots] = useState<PageSnapshot[]>([]);
  const [state, setState] = useState<"idle" | "generating" | "saving" | "ready" | "error">("idle");
  const [savedDirectory, setSavedDirectory] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturePageId, setCapturePageId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState({ completed: 0, total: 0 });
  const [retryToken, setRetryToken] = useState(0);
  const [open, setOpen] = useState(false);
  const pages = scene.pages ?? [];
  const revisionKey = `${scene.id}:${scene.snapshotRevision ?? "1"}`;
  const capturePage = pages.find((page) => page.id === capturePageId) ?? null;
  const shouldRenderSource = ready && state === "generating" && Boolean(capturePage);

  useEffect(() => {
    if (!ready || !pages.length || generatedRevisionRef.current === revisionKey) return;
    generatedRevisionRef.current = revisionKey;
    let cancelled = false;

    const generate = async () => {
      setState("generating");
      setSnapshots([]);
      setErrorMessage(null);
      setSaveWarning(null);
      setSavedDirectory(null);
      setGenerationProgress({ completed: 0, total: pages.length });
      try {
        await waitForFonts();
        const result: PageSnapshot[] = [];
        for (const [index, page] of pages.entries()) {
          if (cancelled) return;
          setCapturePageId(page.id);
          await delay(0);
          await nextPaint();
          if (cancelled) return;
          const root = sourceRef.current;
          const paper = root?.querySelector<HTMLElement>(".recreation-paper");
          if (!paper) throw new Error(`第 ${index + 1} 页截图画布未准备好`);
          const dataUrl = await withTimeout(toPng(paper, {
            cacheBust: true,
            pixelRatio: 1,
            backgroundColor: scene.paper.background === "transparent" ? "#f5efe2" : scene.paper.background,
          }), 15000, `第 ${index + 1} 页截图超时`);
          result.push({ pageId: page.id, title: page.title, dataUrl });
          if (!cancelled) setGenerationProgress({ completed: index + 1, total: pages.length });
        }
        if (cancelled) return;
        setCapturePageId(null);
        setSnapshots(result);
        setState("saving");

        try {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 12000);
          try {
            const response = await fetch("/api/recreation/snapshots", {
              method: "POST",
              headers: { "content-type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                sceneId: scene.id,
                revision: scene.snapshotRevision ?? "1",
                pages: result,
              }),
            });
            const payload = await response.json() as SaveResponse;
            if (!response.ok || !payload.ok || !payload.directory) throw new Error(payload.error || "snapshot save failed");
            if (!cancelled) setSavedDirectory(payload.directory);
          } finally {
            window.clearTimeout(timer);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "自动保存失败";
          console.error("Failed to persist page snapshots", error);
          if (!cancelled) setSaveWarning(message);
        }

        if (!cancelled) setState("ready");
      } catch (error) {
        console.error("Failed to generate page snapshots", error);
        generatedRevisionRef.current = null;
        if (!cancelled) {
          setCapturePageId(null);
          setErrorMessage(error instanceof Error ? error.message : "截图生成失败");
          setState("error");
        }
      }
    };

    void generate();
    return () => { cancelled = true; };
  }, [pages, ready, retryToken, revisionKey, scene.id, scene.paper.background, scene.snapshotRevision]);

  if (!pages.length) return null;

  const retry = () => {
    generatedRevisionRef.current = null;
    setState("idle");
    setErrorMessage(null);
    setRetryToken((value) => value + 1);
  };
  const buttonLabel = state === "generating"
    ? `生成截图 ${generationProgress.completed}/${generationProgress.total}`
    : state === "saving"
      ? "保存截图…"
      : state === "error"
        ? "截图失败，重试"
        : state === "ready"
          ? savedDirectory ? `已保存 ${snapshots.length} 张` : `最终截图 ${snapshots.length}`
          : "场景加载后截图";
  const disabled = !ready || state === "idle" || state === "generating" || state === "saving";

  return <>
    <button className="snapshot-trigger" type="button" onClick={() => state === "error" ? retry() : setOpen(true)} disabled={disabled} title={errorMessage ?? undefined}>
      {buttonLabel}
    </button>

    {shouldRenderSource && capturePage ? <div className="page-snapshot-source" ref={sourceRef} aria-hidden="true">
      <div className="snapshot-capture-page answer-canvas-viewport is-paged-video" data-snapshot-page-id={capturePage.id}>
        <RecreationCanvas scene={scene} completed pageId={capturePage.id} />
      </div>
    </div> : null}

    {open && state === "ready" ? <div className="snapshot-modal" role="dialog" aria-modal="true" aria-label="每页最终截图">
      <div className="snapshot-modal-card">
        <header>
          <div>
            <strong>每页最终截图</strong>
            <span>{snapshots.length} 页 · 场景加载后直接生成，版本变化时覆盖旧截图</span>
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
