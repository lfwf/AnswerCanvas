export type RecreationElement = RecreationText | RecreationStroke | RecreationBox | RecreationMark | RecreationAnnotation | RecreationViewEffect | RecreationPageTurn;
export type RecreationAnimatedElement = RecreationElement & { animated?: true; order: number };
export type RecreationStaticElement = RecreationElement & { animated: false; order?: never };

export interface RecreationDynamicMeta {
  id: string;
  animated?: true;
  order: number;
  pageId?: string;
}

export interface RecreationStaticMeta {
  id: string;
  animated: false;
  order?: never;
  pageId?: string;
}

export type RecreationElementMeta = RecreationDynamicMeta | RecreationStaticMeta;

export interface RecreationPaperStyle {
  background: string;
  pattern: "plain" | "ruled" | "dots";
  patternColor: string;
  spacing: number;
  patternOffset?: number;
  patternThickness?: number;
}

export interface RecreationPage {
  id: string;
  title: string;
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

export type RecreationText = RecreationElementMeta & {
  kind: "text";
  x: number;
  y: number;
  width: number;
  height?: number;
  text: string;
  style?: RecreationTextStyle;
};

export type RecreationStroke = RecreationElementMeta & {
  kind: "stroke";
  path: string;
  color?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  handDrawn?: boolean;
  roughness?: number;
  bowing?: number;
};

export type RecreationBox = RecreationElementMeta & {
  kind: "box";
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
};

export type RecreationMark = RecreationElementMeta & {
  kind: "mark";
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
};

export type RecreationAnnotation = RecreationDynamicMeta & {
  kind: "annotation";
  targetId: string;
  match: string;
  occurrence?: number;
  label: string;
  position?: "above" | "below";
  color?: string;
  fontSize?: number;
  width?: number;
  offsetX?: number;
  offsetY?: number;
  characterJitter?: number;
};

export type RecreationViewEffect = RecreationDynamicMeta & {
  kind: "view";
  mode: "focus" | "restore";
  targetIds?: string[];
  dimOpacity?: number;
  durationMs?: number;
};

export type RecreationPageTurn = RecreationDynamicMeta & {
  kind: "page";
  pageId: string;
  durationMs?: number;
  transition?: "slide" | "fade";
};

export interface RecreationScene {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  sourceName: string;
  createdAt: string;
  width: number;
  height: number;
  paper: RecreationPaperStyle;
  pages?: RecreationPage[];
  elements: RecreationElement[];
}

export function isAnimatedElement(element: RecreationElement): element is RecreationAnimatedElement {
  return element.animated !== false;
}

export function isStaticElement(element: RecreationElement): element is RecreationStaticElement {
  return element.animated === false;
}
