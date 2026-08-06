"use client";
import { RecreationStage } from "@/features/recreation/RecreationStage";
import { currentRecreationScene } from "@/features/recreation/current-scene";
import { withCurrentSceneAnnotations } from "@/features/recreation/current-scene-annotations";

const scene = withCurrentSceneAnnotations(currentRecreationScene);

export default function HomePage() {
  return <RecreationStage scene={scene} />;
}
