import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "./page";

vi.mock("@/features/recreation/RecreationCanvas", () => ({
  RecreationCanvas: () => <div data-testid="scene-thumbnail" />,
}));

describe("HomePage", () => {
  it("renders the multi-scene gallery", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "AnswerCanvas" })).toBeInTheDocument();
    expect(screen.getByText("图片复刻场景库")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "复刻场景列表" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /关于 AI 的核心概念与发展/u })).toHaveAttribute("href", "/scenes/ai-core-concepts");
  });
});
