import type { LayoutBox } from "@/features/layout/layout-types";
export function PenCursor({ box, visible }: { box: LayoutBox | null; visible: boolean }) { if (!box || !visible) return null; return <div className="pen-cursor" aria-hidden="true" style={{ transform: `translate(${box.x + box.width - 12}px, ${box.y + box.height - 6}px) rotate(-22deg)` }}>✎</div>; }
