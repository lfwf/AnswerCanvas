import { immersiveGrammarAnalysisScene } from "./immersive-grammar-analysis";
import { validateRecreationScene } from "../validate-recreation-scene";

function byId(id: string) {
  const element = immersiveGrammarAnalysisScene.elements.find((item) => item.id === id);
  if (!element) throw new Error(`missing ${id}`);
  return element;
}

function order(id: string) {
  const element = byId(id);
  if (element.animated === false) throw new Error(`${id} is static`);
  return element.order;
}

describe("immersive grammar analysis scene", () => {
  it("keeps the source sentence in one canonical text block instead of rewriting it for every analysis layer", () => {
    const sentence = "Although I was tired after work, I still went to the library\nbecause I needed to finish my report before Friday.";
    const copies = immersiveGrammarAnalysisScene.elements.filter((element) => element.kind === "text" && element.text === sentence);
    expect(copies).toHaveLength(1);
    expect(copies[0].id).toBe("full-sentence");
  });

  it("anchors clause and word-role analysis directly to the original sentence", () => {
    for (const id of ["clause-1-label", "clause-2-label", "clause-3-label", "c1-conj", "c1-subject", "c2-verb", "c3-object", "c3-time"]) {
      const element = byId(id);
      expect(element.kind).toBe("annotation");
      if (element.kind === "annotation") expect(element.targetId).toBe("full-sentence");
    }
  });

  it("walks overview, clause 1, clause 2, clause 3, synthesis and summary sequentially before restoring the full note", () => {
    expect(order("focus-overview")).toBeLessThan(order("focus-clause-1"));
    expect(order("focus-clause-1")).toBeLessThan(order("focus-clause-2"));
    expect(order("focus-clause-2")).toBeLessThan(order("focus-clause-3"));
    expect(order("focus-clause-3")).toBeLessThan(order("focus-synthesis"));
    expect(order("focus-synthesis")).toBeLessThan(order("focus-summary"));
    expect(order("focus-summary")).toBeLessThan(order("restore-final"));
    const restore = byId("restore-final");
    expect(restore.kind).toBe("view");
    if (restore.kind === "view") expect(restore.mode).toBe("restore");
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(immersiveGrammarAnalysisScene)).toEqual([]);
  });
});
