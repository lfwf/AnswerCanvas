import { validateRecreationScene } from "../validate-recreation-scene";
import { iphone18ProRumorsVideoScene } from "./iphone18-pro-rumors-video";

function byId(id: string) {
  const element = iphone18ProRumorsVideoScene.elements.find((item) => item.id === id);
  if (!element) throw new Error(`missing ${id}`);
  return element;
}

function order(id: string) {
  const element = byId(id);
  if (element.animated === false) throw new Error(`${id} is static`);
  return element.order;
}

function textCenterX(id: string) {
  const element = byId(id);
  if (element.kind !== "text") throw new Error(`${id} is not text`);
  return element.x + element.width / 2;
}

describe("iPhone 18 Pro paged rumor video scene", () => {
  it("uses a vertical recording canvas, explicit snapshot revision and nine readable pages", () => {
    expect(iphone18ProRumorsVideoScene.width).toBe(900);
    expect(iphone18ProRumorsVideoScene.height).toBe(1600);
    expect(iphone18ProRumorsVideoScene.snapshotRevision).toBe("2026-08-08.7");
    expect(iphone18ProRumorsVideoScene.pages?.map((page) => page.id)).toEqual(["cover", "chip-ai", "memory", "display", "camera", "battery", "connectivity", "appearance", "summary"]);
  });

  it("writes chip facts, highlights them, then constructs the performance chart with independent ticks", () => {
    expect(order("chip-bullets")).toBeLessThan(order("chip-hi-2nm"));
    expect(order("chip-hi-ai")).toBeLessThan(order("perf-label"));
    expect(order("perf-label")).toBeLessThan(order("perf-bar-frame"));
    expect(order("perf-bar-frame")).toBeLessThan(order("perf-axis"));
    expect(order("perf-axis")).toBeLessThan(order("perf-tick-left"));
    expect(order("perf-tick-left")).toBeLessThan(order("perf-tick-mid"));
    expect(order("perf-tick-mid")).toBeLessThan(order("perf-tick-right"));
    expect(order("perf-tick-right")).toBeLessThan(order("perf-fill"));
    expect(order("perf-fill")).toBeLessThan(order("perf-value"));
    expect(order("power-bar-frame")).toBeLessThan(order("power-axis"));
    expect(order("power-axis")).toBeLessThan(order("power-tick-left"));
    expect(order("power-tick-left")).toBeLessThan(order("power-tick-mid"));
    expect(order("power-tick-mid")).toBeLessThan(order("power-tick-right"));
    expect(order("power-tick-right")).toBeLessThan(order("power-fill"));
    expect(order("power-fill")).toBeLessThan(order("power-value"));
    expect(order("power-value")).toBeLessThan(order("chip-fast"));
  });

  it("centers every chart tick label on the actual tick coordinate", () => {
    for (const [id, x] of [["perf-tick-left", 270], ["perf-tick-mid", 485], ["perf-tick-right", 700], ["power-tick-left", 270], ["power-tick-mid", 485], ["power-tick-right", 700]] as const) {
      expect(textCenterX(id)).toBe(x);
    }
  });

  it("uses dense overlapping left-to-right scribble fills for the comparison bars", () => {
    for (const id of ["perf-fill", "power-fill"] as const) {
      const element = byId(id);
      if (element.kind !== "stroke") throw new Error(`${id} is not a stroke`);
      expect(element.handDrawn).toBe(false);
      expect(element.width).toBeGreaterThanOrEqual(7);
      expect((element.path.match(/L /gu) ?? []).length).toBeGreaterThan(140);
    }
  });

  it("keeps chart frames and axes visibly hand-drawn instead of ruler-straight", () => {
    for (const id of ["perf-axis", "power-axis", "battery-chart-axes"] as const) {
      const element = byId(id);
      if (element.kind !== "stroke") throw new Error(`${id} is not a stroke`);
      expect(element.handDrawn).not.toBe(false);
      expect(element.roughness).toBeGreaterThanOrEqual(1.35);
      expect(element.bowing).toBeGreaterThanOrEqual(1.05);
    }
    for (const id of ["perf-bar-frame", "power-bar-frame", "battery-outline"] as const) {
      const element = byId(id);
      if (element.kind !== "box") throw new Error(`${id} is not a box`);
      expect(element.handDrawn).not.toBe(false);
      expect(element.roughness).toBeGreaterThanOrEqual(1.4);
      expect(element.bowing).toBeGreaterThanOrEqual(1);
    }
  });

  it("holds every completed video page for at least one second before the next page turn", () => {
    for (const id of ["cover-hold", "chip-hold", "memory-hold", "display-hold", "camera-hold", "battery-hold", "connectivity-hold", "appearance-hold"] as const) {
      const element = byId(id);
      if (element.kind !== "view") throw new Error(`${id} is not a view hold`);
      expect(element.durationMs).toBeGreaterThanOrEqual(1000);
    }
  });

  it("uses the baseline-safe full-width range mark for battery percentages", () => {
    for (const id of ["battery-bullets", "battery-value", "sum-6"] as const) {
      const element = byId(id);
      if (element.kind !== "text") throw new Error(`${id} is not text`);
      expect(element.text).toContain("～");
      expect(element.text).not.toContain("~");
    }
  });

  it("renders starlight white as a clearly separated white swatch", () => {
    const swatch = byId("swatch-white");
    const inner = byId("swatch-white-inner");
    if (swatch.kind !== "box" || inner.kind !== "box") throw new Error("white swatch boxes are missing");
    expect(swatch.fill).toBe("#ffffff");
    expect(swatch.stroke).toBe("#595a5c");
    expect(swatch.strokeWidth).toBeGreaterThanOrEqual(3);
    expect(inner.stroke).toBe("#d2d5d9");
    expect(order("swatch-white")).toBeLessThan(order("swatch-white-inner"));
    expect(order("swatch-white-inner")).toBeLessThan(order("swatch-white-label"));
  });

  it("enlarges authored scene typography for phone readability", () => {
    const body = byId("battery-bullets");
    const title = byId("battery-title");
    const label = byId("swatch-white-label");
    if (body.kind !== "text" || title.kind !== "text" || label.kind !== "text") throw new Error("expected text elements");
    expect(body.style?.fontSize).toBeGreaterThan(39);
    expect(title.style?.fontSize).toBeGreaterThan(50);
    expect(label.style?.fontSize).toBeGreaterThan(31);
  });

  it("keeps implementation meta copy out and gives silent-video pages factual takeaways", () => {
    expect(iphone18ProRumorsVideoScene.elements.some((element) => element.id === "chip-note")).toBe(false);
    expect(iphone18ProRumorsVideoScene.elements.some((element) => element.id === "memory-explain")).toBe(false);
    for (const id of ["chip-fast", "chip-efficient", "chip-ai-takeaway", "display-recap", "camera-bottom", "battery-takeaway", "connectivity-takeaway", "appearance-takeaway"]) expect(byId(id)).toBeTruthy();
  });

  it("finishes each page before turning to the next one", () => {
    expect(order("chip-hold")).toBeLessThan(order("turn-memory"));
    expect(order("memory-hold")).toBeLessThan(order("turn-display"));
    expect(order("display-hold")).toBeLessThan(order("turn-camera"));
    expect(order("camera-hold")).toBeLessThan(order("turn-battery"));
    expect(order("battery-hold")).toBeLessThan(order("turn-connectivity"));
    expect(order("connectivity-hold")).toBeLessThan(order("turn-appearance"));
    expect(order("appearance-hold")).toBeLessThan(order("turn-summary"));
  });

  it("draws visual explanations before their final labels", () => {
    expect(order("memory-arrow")).toBeLessThan(order("memory-12-box"));
    expect(order("phone-outline")).toBeLessThan(order("screen-diagonal"));
    expect(order("screen-diagonal")).toBeLessThan(order("screen-69"));
    expect(order("before-face")).toBeLessThan(order("camera-arrow"));
    expect(order("camera-arrow")).toBeLessThan(order("after-frame"));
    expect(order("battery-chart-axes")).toBeLessThan(order("battery-trend"));
    expect(order("battery-trend")).toBeLessThan(order("battery-value"));
    expect(order("before-frame-conn")).toBeLessThan(order("before-sig-1"));
    expect(order("before-sig-1")).toBeLessThan(order("before-sig-2"));
    expect(order("before-sig-2")).toBeLessThan(order("before-sig-3"));
    expect(order("before-sig-3")).toBeLessThan(order("before-delay-bar"));
    expect(order("before-delay-bar")).toBeLessThan(order("compare-arrow"));
    expect(order("compare-arrow")).toBeLessThan(order("after-frame-conn"));
    expect(order("after-sig-1")).toBeLessThan(order("after-sig-2"));
    expect(order("after-sig-2")).toBeLessThan(order("after-sig-3"));
    expect(order("after-sig-3")).toBeLessThan(order("after-sig-4"));
    expect(order("after-sig-4")).toBeLessThan(order("after-delay-bar"));
  });

  it("draws every appearance swatch before writing its color name", () => {
    for (const suffix of ["black", "white", "blue", "gray", "green", "rose"]) expect(order(`swatch-${suffix}`)).toBeLessThan(order(`swatch-${suffix}-label`));
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(iphone18ProRumorsVideoScene)).toEqual([]);
  });
});