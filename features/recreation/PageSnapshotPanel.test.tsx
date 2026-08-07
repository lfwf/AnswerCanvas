import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import type { RecreationScene } from "./recreation-types";

const { toPng } = vi.hoisted(() => ({ toPng: vi.fn(async () => "data:image/png;base64,c25hcHNob3Q=") }));
vi.mock("html-to-image", () => ({ toPng }));
vi.mock("./RecreationCanvas", () => ({
  RecreationCanvas: ({ pageId }: { pageId?: string }) => <article className="recreation-paper" data-page={pageId}>page</article>,
}));

import { PageSnapshotPanel } from "./PageSnapshotPanel";

const scene: RecreationScene = {
  id: "paged-test",
  title: "Paged test",
  description: "test",
  sourceName: "test.png",
  createdAt: "2026-08-07",
  snapshotRevision: "2",
  width: 900,
  height: 1600,
  paper: { background: "#fbfaf6", pattern: "plain", patternColor: "transparent", spacing: 40 },
  pages: [{ id: "one", title: "第一页" }, { id: "two", title: "第二页" }],
  elements: [],
};

beforeEach(() => {
  toPng.mockReset();
  toPng.mockResolvedValue("data:image/png;base64,c25hcHNob3Q=");
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0));
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true, directory: "artifacts/recreation/paged-test/final-pages", files: ["01-one.png", "02-two.png"] }), { status: 200, headers: { "content-type": "application/json" } })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PageSnapshotPanel", () => {
  it("waits for playback completion, then generates and persists one final PNG per page", async () => {
    const { rerender } = render(<PageSnapshotPanel scene={scene} ready={false} />);
    expect(screen.getByRole("button", { name: "首轮结束后截图" })).toBeDisabled();
    expect(toPng).not.toHaveBeenCalled();

    rerender(<PageSnapshotPanel scene={scene} ready />);
    await waitFor(() => expect(screen.getByRole("button", { name: "已保存 2 张" })).toBeEnabled());
    expect(toPng).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/recreation/snapshots", expect.objectContaining({ method: "POST" }));

    fireEvent.click(screen.getByRole("button", { name: "已保存 2 张" }));
    expect(screen.getByRole("dialog", { name: "每页最终截图" })).toBeInTheDocument();
    expect(screen.getByText("artifacts/recreation/paged-test/final-pages")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "下载 PNG" })).toHaveLength(2);
  });

  it("exits a failed generation state and lets the user retry", async () => {
    toPng.mockRejectedValueOnce(new Error("capture failed"));
    render(<PageSnapshotPanel scene={scene} ready />);

    await waitFor(() => expect(screen.getByRole("button", { name: "截图失败，重试" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "截图失败，重试" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "已保存 2 张" })).toBeEnabled());
    expect(toPng).toHaveBeenCalledTimes(3);
  });
});
