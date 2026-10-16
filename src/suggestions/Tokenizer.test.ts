import { describe, expect, it } from "vitest";
import { normalizeText } from "./Tokenizer.ts";

describe("normalizeText", () => {
  it("lowercases mixed-case text", () => {
    expect(normalizeText("Team ROADmap Review")).toBe("team roadmap review");
  });

  it("preserves accents when lowercasing composed characters", () => {
    expect(normalizeText("CAFÉ REUNIÓN AÑO")).toBe("café reunión año");
  });

  it("normalizes decomposed accents to the same NFC text as composed accents", () => {
    expect(normalizeText("CAFE\u0301 REUNIO\u0301N AN\u0303O")).toBe("café reunión año");
    expect(normalizeText("cafe\u0301")).toBe(normalizeText("café"));
  });

  it("keeps normalized text stable on repeated normalization", () => {
    const normalized = normalizeText("CAFE\u0301 ReVieW");
    expect(normalizeText(normalized)).toBe(normalized);
  });
});
