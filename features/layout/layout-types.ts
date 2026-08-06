import type { ArrowAnnotation, NoteBlock, TextAnnotation, TextSpan } from "@/features/notes/note-schema";

export interface LayoutBox { x: number; y: number; width: number; height: number; }
export type LayoutElementKind = "question" | "title" | "text" | "bullet-list" | "comparison" | "flow-diagram" | "line-chart" | "callout" | "arrow" | "footer";
export interface BaseLayoutElement { id: string; blockId?: string; pageIndex: number; elementIndex: number; kind: LayoutElementKind; box: LayoutBox; jitter: { rotate: number; offsetY: number }; }
export interface QuestionLayoutElement extends BaseLayoutElement { kind: "question"; payload: { lines: string[]; fullQuestion: string; ellipsized: boolean }; }
export interface TitleLayoutElement extends BaseLayoutElement { kind: "title"; payload: { text: string }; }
export interface TextLayoutElement extends BaseLayoutElement { kind: "text" | "callout"; payload: { spans: TextSpan[]; lines: string[]; annotations: TextAnnotation[]; tone?: "idea" | "warning" | "summary" }; }
export interface ListLayoutElement extends BaseLayoutElement { kind: "bullet-list"; payload: { items: Array<{ id: string; spans: TextSpan[]; lines: string[] }>; annotations: TextAnnotation[] }; }
export interface ComparisonLayoutElement extends BaseLayoutElement { kind: "comparison"; payload: Extract<NoteBlock, { type: "comparison" }>; }
export interface FlowLayoutElement extends BaseLayoutElement { kind: "flow-diagram"; payload: Extract<NoteBlock, { type: "flow-diagram" }>; }
export interface ChartLayoutElement extends BaseLayoutElement { kind: "line-chart"; payload: Extract<NoteBlock, { type: "line-chart" }>; }
export interface ArrowLayoutElement extends BaseLayoutElement { kind: "arrow"; payload: ArrowAnnotation & { fromPoint: { x: number; y: number }; toPoint: { x: number; y: number } }; }
export interface FooterLayoutElement extends BaseLayoutElement { kind: "footer"; payload: { text: "内容已精简" }; }
export type LayoutElement = QuestionLayoutElement | TitleLayoutElement | TextLayoutElement | ListLayoutElement | ComparisonLayoutElement | FlowLayoutElement | ChartLayoutElement | ArrowLayoutElement | FooterLayoutElement;
export interface LayoutPage { index: number; width: 794; height: 1123; elements: LayoutElement[]; }
export interface LayoutDocument { noteId: string; pages: LayoutPage[]; diagnostics: string[]; }
