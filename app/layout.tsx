import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AnswerCanvas", description: "把 AI 回答动态写成 A4 手写笔记" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
