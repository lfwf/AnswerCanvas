import { notFound, permanentRedirect } from "next/navigation";
import { RecreationStage } from "@/features/recreation/RecreationStage";
import { listScenes, resolveSceneId } from "@/features/recreation/scene-registry";

export default async function ScenePage({ params }: { params: Promise<{ sceneId: string }> }) {
  const { sceneId } = await params;
  const resolution = resolveSceneId(sceneId);
  if (!resolution) notFound();
  if (resolution.kind === "alias") permanentRedirect(`/scenes/${resolution.canonicalId}`);
  return <RecreationStage key={resolution.canonicalId} scene={resolution.scene} history={listScenes()} />;
}
