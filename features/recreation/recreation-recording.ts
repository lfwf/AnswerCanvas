import type { RecreationScene } from "./recreation-types";

export const VIDEO_RECORDING_WIDTH = 1080;
export const VIDEO_RECORDING_HEIGHT = 1920;

export function recordingScaleFor(scene: RecreationScene) {
  if (!scene.pages?.length) return 1;
  return Math.min(VIDEO_RECORDING_WIDTH / scene.width, VIDEO_RECORDING_HEIGHT / scene.height);
}

export function recordingFrameFor(scene: RecreationScene) {
  const scale = recordingScaleFor(scene);
  return {
    width: Math.round(scene.width * scale),
    height: Math.round(scene.height * scale),
    scale,
  };
}
