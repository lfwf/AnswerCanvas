"use client";
import { useEffect, useState } from "react";
import type { NoteDocument } from "@/features/notes/note-schema";
import { layoutNote } from "@/features/layout/layout-note";
import type { LayoutDocument } from "@/features/layout/layout-types";
import { selectLockedTextMeasurer } from "@/features/layout/font-readiness";
import { createCanvasTextMeasurer, fallbackTextMeasurer } from "@/features/layout/text-measurer";

export function useLaidOutNote(note: NoteDocument | null): LayoutDocument | null {
  const [layout, setLayout] = useState<LayoutDocument | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) setLayout(null); });
    if (!note) return () => { active = false; };
    const primary = createCanvasTextMeasurer();
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    const handwritingReady = fonts?.load
      ? Promise.all([
        fonts.load('400 29px "AnswerCanvasHandwriting"', "手写体"),
        fonts.load('500 29px "Caveat"', "Skill"),
      ]).catch(() => [])
      : Promise.resolve([]);
    void Promise.all([
      handwritingReady,
      selectLockedTextMeasurer({ fonts, primary, fallback: fallbackTextMeasurer }),
    ]).then(([, measurer]) => { if (active) setLayout(layoutNote(note, measurer)); });
    return () => { active = false; };
  }, [note]);
  return layout;
}
