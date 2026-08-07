import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SceneGallery } from "./SceneGallery";
import { listScenes } from "./scene-registry";
import type { RecreationScene } from "./recreation-types";

vi.mock("./RecreationCanvas", () => ({
  RecreationCanvas: ({ scene, completed }: { scene: RecreationScene; completed?: boolean }) => (
    <div data-completed={completed ? "true" : "false"} data-scene-id={scene.id} />
  ),
}));

describe("SceneGallery", () => {
  it("shows all registered scenes and links to canonical URLs", () => {
    render(<SceneGallery scenes={listScenes()} />);
    expect(screen.getByRole("link", { name: /未来3年，最需要 AI 能力的岗位/ })).toHaveAttribute("href", "/scenes/future-ai-jobs");
    expect(screen.getByRole("link", { name: /关于 AI 的核心概念与发展/ })).toHaveAttribute("href", "/scenes/ai-core-concepts");
    expect(screen.getByRole("link", { name: /Skill 与 Agent 课堂笔记/ })).toHaveAttribute("href", "/scenes/skill-agent-notes");
  });

  it("uses completed canvases without player controls", () => {
    const { container } = render(<SceneGallery scenes={listScenes()} />);
    const canvases = container.querySelectorAll("[data-scene-id]");
    expect(canvases).toHaveLength(3);
    expect([...canvases].every((canvas) => canvas.getAttribute("data-completed") === "true")).toBe(true);
    expect(screen.queryByRole("button", { name: "重播" })).toBeNull();
    expect(container.querySelector(".recreation-toolbar")).toBeNull();
  });
});
