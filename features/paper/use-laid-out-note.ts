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
    void selectLockedTextMeasurer({ fonts: typeof document !== "undefined" ? document.fonts : undefined, primary, fallback: fallbackTextMeasurer }).then((measurer) => { if (active) setLayout(layoutNote(note, measurer)); });
    return () => { active = false; };
  }, [note]);
  return layout;
}
