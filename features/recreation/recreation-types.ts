export type RecreationElement = RecreationText | RecreationStroke | RecreationBox | RecreationMark;

export interface RecreationPaperStyle {
  background?: string;
  ruleColor?: string;
  ruleSpacing?: number;
  ruleThickness?: number;
  ruleOffset?: number;
}

export interface RecreationTextStyle {
  color?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: string;
  rotate?: number;
  nudgeX?: number;
  nudgeY?: number;
  baselineShift?: number;
  snapToRule?: boolean;
  characterJitter?: number;
}

export interface RecreationText {
  id: string;
  kind: "text";
  order: number;
  x: number;
  y: number;
  width: number;
  height?: number;
  text: string;
  style?: RecreationTextStyle;
}

export interface RecreationStroke {
  id: string;
  kind: "stroke";
  order: number;
  path: string;
  color?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  handDrawn?: boolean;
  roughness?: number;
  bowing?: number;
}

export interface RecreationBox {
  id: string;
  kind: "box";
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  dash?: string;
  radius?: number;
  handDrawn?: boolean;
  roughness?: number;
  bowing?: number;
}

export interface RecreationMark {
  id: string;
  kind: "mark";
  order: number;
  targetId: string;
  match: string;
  occurrence?: number;
  mark: "underline" | "strike" | "highlight" | "circle";
  color?: string;
  width?: number;
  opacity?: number;
  offset?: number;
  padding?: number;
  wobble?: number;
}

export interface RecreationScene {
  id: string;
  sourceName: string;
  width: number;
  height: number;
  paper?: RecreationPaperStyle;
  elements: RecreationElement[];
}
