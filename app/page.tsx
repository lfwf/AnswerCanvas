"use client";
import { RecreationStage } from "@/features/recreation/RecreationStage";
import { currentRecreationScene } from "@/features/recreation/current-scene";

export default function HomePage() {
  return <RecreationStage scene={currentRecreationScene} />;
}
