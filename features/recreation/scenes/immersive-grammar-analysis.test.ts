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

  it("uses generous source-sentence line spacing for in-place annotations", () => {
    const sentence = byId("full-sentence");
    expect(sentence.kind).toBe("text");
    if (sentence.kind === "text") expect(sentence.style?.lineHeight).toBeGreaterThanOrEqual(88);
    for (const id of ["c1-conj", "c2-verb", "c3-time"]) {
      const annotation = byId(id);
      expect(annotation.kind).toBe("annotation");
      if (annotation.kind === "annotation") expect(annotation.gap).toBeGreaterThanOrEqual(18);
    }
  });

  it("anchors clause and word-role analysis directly to the original sentence", () => {
    for (const id of ["clause-1-label", "clause-2-label", "clause-3-label", "c1-conj", "c1-subject", "c2-verb", "c3-object", "c3-time"]) {
      const element = byId(id);
      expect(element.kind).toBe("annotation");
      if (element.kind === "annotation") expect(element.targetId).toBe("full-sentence");
    }
  });

  it("models the teacher flow as named phases from clause split through final board", () => {
    const phaseIds = ["focus-overview", "focus-clause-1", "focus-clause-2", "focus-clause-3", "focus-structure", "focus-translation", "focus-summary", "restore-final"];
    const phases = phaseIds.map((id) => {
      const element = byId(id);
      expect(element.kind).toBe("view");
      return element.kind === "view" ? element.phase : undefined;
    });
    expect(phases).toEqual(["split-clauses", "pos-clause-1", "pos-clause-2", "pos-clause-3", "sentence-structure", "translation", "summary", "final-board"]);
    for (let index = 1; index < phaseIds.length; index += 1) expect(order(phaseIds[index - 1])).toBeLessThan(order(phaseIds[index]));
  });

  it("retains only useful context as the teacher moves between phases", () => {
    const clause2 = byId("focus-clause-2");
    expect(clause2.kind).toBe("view");
    if (clause2.kind === "view") {
      expect(clause2.targetIds).toContain("full-sentence");
      expect(clause2.elementOpacity?.["clause-1-mark"]).toBeCloseTo(0.2);
      expect(clause2.elementOpacity?.["c1-conj"]).toBeLessThan(0.1);
    }

    const structure = byId("focus-structure");
    expect(structure.kind).toBe("view");
    if (structure.kind === "view") {
      expect(structure.elementOpacity?.["full-sentence"]).toBeGreaterThan(0.6);
      expect(structure.elementOpacity?.["c3-object"]).toBeLessThan(0.05);
    }

    const translation = byId("focus-translation");
    expect(translation.kind).toBe("view");
    if (translation.kind === "view") expect(translation.elementOpacity?.["structure-formula"]).toBeGreaterThan(0.5);
  });

  it("passes the shared scene validator", () => {
    expect(validateRecreationScene(immersiveGrammarAnalysisScene)).toEqual([]);
  });
});
