import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/u;
const MAX_PAGES = 30;
const MAX_PAGE_BYTES = 12 * 1024 * 1024;

interface SnapshotPagePayload {
  pageId: string;
  title: string;
  dataUrl: string;
}

interface SnapshotPayload {
  sceneId: string;
  revision?: string;
  pages: SnapshotPagePayload[];
}

function safeSegment(value: string, field: string) {
  if (!SAFE_ID.test(value)) throw new Error(`${field} is invalid`);
  return value;
}

function decodePng(dataUrl: string) {
  const prefix = "data:image/png;base64,";
  if (!dataUrl.startsWith(prefix)) throw new Error("snapshot must be a PNG data URL");
  const buffer = Buffer.from(dataUrl.slice(prefix.length), "base64");
  if (!buffer.length || buffer.length > MAX_PAGE_BYTES) throw new Error("snapshot PNG size is invalid");
  return buffer;
}

function fileName(index: number, pageId: string) {
  return `${String(index + 1).padStart(2, "0")}-${safeSegment(pageId, "pageId")}.png`;
}

export async function POST(request: Request) {
  let tempDirectory: string | null = null;
  try {
    const payload = await request.json() as SnapshotPayload;
    const sceneId = safeSegment(payload.sceneId, "sceneId");
    if (!Array.isArray(payload.pages) || !payload.pages.length || payload.pages.length > MAX_PAGES) throw new Error("pages are invalid");

    const outputDirectory = path.join(process.cwd(), "artifacts", "recreation", sceneId, "final-pages");
    const parentDirectory = path.dirname(outputDirectory);
    tempDirectory = `${outputDirectory}.tmp-${process.pid}-${Date.now()}`;

    await fs.rm(tempDirectory, { recursive: true, force: true });
    await fs.mkdir(tempDirectory, { recursive: true });

    const files: string[] = [];
    for (const [index, page] of payload.pages.entries()) {
      const name = fileName(index, page.pageId);
      await fs.writeFile(path.join(tempDirectory, name), decodePng(page.dataUrl));
      files.push(name);
    }

    await fs.writeFile(path.join(tempDirectory, "manifest.json"), JSON.stringify({
      sceneId,
      revision: payload.revision ?? "1",
      generatedAt: new Date().toISOString(),
      pages: payload.pages.map((page, index) => ({ pageId: page.pageId, title: page.title, file: files[index] })),
    }, null, 2));

    await fs.mkdir(parentDirectory, { recursive: true });
    // Replace the whole completed-page set so no stale image from an older scene revision survives.
    await fs.rm(outputDirectory, { recursive: true, force: true });
    await fs.rename(tempDirectory, outputDirectory);
    tempDirectory = null;

    return NextResponse.json({
      ok: true,
      directory: path.relative(process.cwd(), outputDirectory).split(path.sep).join("/"),
      files,
    });
  } catch (error) {
    if (tempDirectory) await fs.rm(tempDirectory, { recursive: true, force: true }).catch(() => undefined);
    const message = error instanceof Error ? error.message : "snapshot save failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
