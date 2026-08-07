import { SceneGallery } from "@/features/recreation/SceneGallery";
import { listScenes } from "@/features/recreation/scene-registry";

export default function HomePage() {
  return <SceneGallery scenes={listScenes()} />;
}
