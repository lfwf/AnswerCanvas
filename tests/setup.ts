import "@testing-library/jest-dom/vitest";

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", { value: { ...(globalThis.crypto ?? {}), randomUUID: () => "00000000-0000-4000-8000-000000000000" }, configurable: true });
}
if (!globalThis.matchMedia) {
  Object.defineProperty(globalThis, "matchMedia", { value: () => ({ matches: false, media: "", onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }), configurable: true });
}
if (!globalThis.ResizeObserver) {
  class TestResizeObserver { observe() {} unobserve() {} disconnect() {} }
  Object.defineProperty(globalThis, "ResizeObserver", { value: TestResizeObserver, configurable: true });
}
