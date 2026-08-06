import { render, screen } from "@testing-library/react";
import HomePage from "./page";
describe("HomePage", () => { it("renders the image recreation shell", () => { render(<HomePage />); expect(screen.getByRole("heading", { name: "AnswerCanvas" })).toBeInTheDocument(); expect(screen.getByText("图片转手写")).toBeInTheDocument(); expect(screen.getByRole("region", { name: "手写复刻画布" })).toBeInTheDocument(); }); });
