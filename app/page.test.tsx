import { render, screen } from "@testing-library/react";
import HomePage from "./page";
vi.mock("@/features/chat/use-chat-session", () => ({ useChatSession: () => ({ state: { turns: [] }, submit: vi.fn(), retry: vi.fn(), select: vi.fn() }) }));
describe("HomePage", () => { it("renders the product shell", () => { render(<HomePage />); expect(screen.getByRole("heading", { name: "AnswerCanvas" })).toBeInTheDocument(); expect(screen.getByRole("textbox", { name: "输入你的问题" })).toBeInTheDocument(); }); });
