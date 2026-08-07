import { render, screen } from "@testing-library/react";
import { SceneGallery } from "./SceneGallery";
import { listScenes } from "./scene-registry";

describe("SceneGallery", () => {
  it("shows both registered scenes and links to canonical URLs", () => {
    render(<SceneGallery scenes={listScenes()} />);
    expect(screen.getByRole("link", { name: /关于 AI 的核心概念与发展/ })).toHaveAttribute("href", "/scenes/ai-core-concepts");
    expect(screen.getByRole("link", { name: /Skill 与 Agent 课堂笔记/ })).toHaveAttribute("href", "/scenes/skill-agent-notes");
  });

  it("uses completed canvases without player controls", () => {
    const { container } = render(<SceneGallery scenes={listScenes()} />);
    expect(container.querySelectorAll("[data-scene-id]")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "重播" })).toBeNull();
    expect(container.querySelector(".recreation-toolbar")).toBeNull();
  });
});
