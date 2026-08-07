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

describe("iPhone 18 Pro paged rumor video scene", () => {
  it("uses a vertical recording canvas and nine readable pages", () => {
    expect(iphone18ProRumorsVideoScene.width).toBe(900);
    expect(iphone18ProRumorsVideoScene.height).toBe(1600);
    expect(iphone18ProRumorsVideoScene.pages?.map((page) => page.id)).toEqual(["cover", "chip-ai", "memory", "display", "camera", "battery", "connectivity", "appearance", "summary"]);
  });

  it("writes chip facts before constructing and filling the performance chart", () => {
    expect(order("chip-bullets")).toBeLessThan(order("perf-label"));
    expect(order("perf-label")).toBeLessThan(order("perf-bar-frame"));
    expect(order("perf-bar-frame")).toBeLessThan(order("perf-axis"));
    expect(order("perf-axis")).toBeLessThan(order("perf-ticks"));
    expect(order("perf-ticks")).toBeLessThan(order("perf-fill"));
    expect(order("perf-fill")).toBeLessThan(order("perf-value"));
    expect(order("power-bar-frame")).toBeLessThan(order("power-axis"));
    expect(order("power-axis")).toBeLessThan(order("power-ticks"));
    expect(order("power-ticks")).toBeLessThan(order("power-fill"));
    expect(order("power-fill")).toBeLessThan(order("power-value"));
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
