import Link from "next/link";
import { RecreationCanvas } from "./RecreationCanvas";
import type { RecreationScene } from "./recreation-types";
import "./recreation.css";

function SceneThumbnail({ scene }: { scene: RecreationScene }) {
  const maxWidth = 280;
  const maxHeight = 360;
  const scale = Math.min(maxWidth / scene.width, maxHeight / scene.height);
  return <div className="scene-thumbnail" style={{ width: scene.width * scale, height: scene.height * scale }} aria-hidden="true">
    <div className="scene-thumbnail-scale" style={{ width: scene.width, height: scene.height, transform: `scale(${scale})` }}>
      <RecreationCanvas scene={scene} completed />
    </div>
  </div>;
}

export function SceneGallery({ scenes }: { scenes: RecreationScene[] }) {
  return <main className="scene-gallery-shell">
    <header className="scene-gallery-header">
      <div className="brand-mark">AC</div>
      <div><h1>AnswerCanvas</h1><p>图片复刻场景库</p></div>
    </header>
    <section className="scene-gallery-intro">
      <p className="scene-gallery-kicker">IMAGE → HANDWRITTEN PLAYBACK</p>
      <h2>每张参考图，保留成一个独立可播放场景</h2>
      <p>以后把同类笔记图片交给 Codex，只新增场景文件并注册，不覆盖已有作品。公共手写渲染与单笔时间轴保持复用。</p>
    </section>
    <section className="scene-gallery-grid" aria-label="复刻场景列表">
      {scenes.map((scene) => <Link className="scene-card" href={`/scenes/${scene.id}`} key={scene.id}>
        <div className="scene-card-preview"><SceneThumbnail scene={scene} /></div>
        <div className="scene-card-copy">
          <div className="scene-card-title-row"><h3>{scene.title}</h3><span>打开 →</span></div>
          <p>{scene.description}</p>
          <small>{scene.sourceName} · {scene.width} × {scene.height}</small>
        </div>
      </Link>)}
    </section>
  </main>;
}
