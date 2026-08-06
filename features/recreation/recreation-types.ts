export type RecreationElement = RecreationText | RecreationStroke | RecreationBox;

export interface RecreationTextStyle {
  color?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: string;
  rotate?: number;
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
}

export interface RecreationScene {
  id: string;
  sourceName: string;
  width: number;
  height: number;
  elements: RecreationElement[];
}
