import { buildTimeline } from "./build-timeline";
import { layoutNote } from "@/features/layout/layout-note";
import { validNote } from "@/tests/fixtures/notes";

const measurer = { measure: (text: string, size: number) => Array.from(text).length * size * 0.6 };

describe("buildTimeline", () => {
  it("excludes the static question and starts with the answer title", () => {
    const timeline = buildTimeline(layoutNote(validNote, measurer));
    expect(timeline.events.some((event) => event.elementId.includes(":question"))).toBe(false);
    expect(timeline.events[0].elementId).toBe("note-1:title");
    expect(timeline.events[0].durationMs).toBeGreaterThanOrEqual(180);
  });

  it("never overlaps two animation events", () => {
    const timeline = buildTimeline(layoutNote(validNote, measurer));
    for (let index = 1; index < timeline.events.length; index += 1) {
      expect(timeline.events[index].startMs).toBeGreaterThanOrEqual(timeline.events[index - 1].endMs);
    }
  });
});
