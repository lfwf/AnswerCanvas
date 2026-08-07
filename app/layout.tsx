import type { Metadata } from "next";
import "./globals.css";
import "./page-transitions.css";

export const metadata: Metadata = {
  title: "AnswerCanvas",
  description: "把参考图片重建为可逐笔播放的手写画布场景",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
