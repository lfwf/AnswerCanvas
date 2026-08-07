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
    expect(iphone18ProRumorsVideoScene.snapshotRevision).toBe("2026-08-07.3");
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
    expect(order("sig1")).toBeLessThan(order("sig2"));
    expect(order("sig2")).toBeLessThan(order("sig3"));
    expect(order("sig3")).toBeLessThan(order("sig4"));
    expect(order("wifi-dot")).toBeLessThan(order("wifi-arc-1"));
    expect(order("wifi-arc-1")).toBeLessThan(order("wifi-arc-2"));
    expect(order("wifi-arc-2")).toBeLessThan(order("wifi-arc-3"));
  });

  it("draws every appearance swatch before writing its color name", () => {
    for (const suffix of ["black", "white", "blue", "gray", "green", "rose"]) expect(order(`swatch-${suffix}`)).toBeLessThan(order(`swatch-${suffix}-label`));
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(iphone18ProRumorsVideoScene)).toEqual([]);
  });
});
