import { describe, expect, it, vi } from "vitest";
import { filterTokens, getStopwords, parseStopwords } from "./TokenFilter.ts";

describe("parseStopwords", () => {
  it("parses LF and CRLF lists identically", () => {
    const expected = new Set(["the", "and", "para", "también"]);
    expect(parseStopwords("the\nand\npara\ntambién\n")).toEqual(expected);
    expect(parseStopwords("the\r\nand\r\npara\r\ntambién\r\n")).toEqual(expected);
  });

  it("trims entries and ignores blank lines", () => {
    expect(parseStopwords("  the  \n\n\tand\t\n \t\r\n\u00a0para\u00a0")).toEqual(
      new Set(["the", "and", "para"]),
    );
  });

  it("returns an empty set for empty and whitespace-only lists", () => {
    expect(parseStopwords("")).toEqual(new Set());
    expect(parseStopwords(" \t\n\r\n\u00a0")).toEqual(new Set());
  });

  it("normalizes mixed case and decomposed accents before deduplicating", () => {
    expect(parseStopwords("TAMBIÉN\ntambie\u0301n\ntambién\nTHE\nthe\nthe")).toEqual(
      new Set(["también", "the"]),
    );
  });

  it("preserves accents rather than merging distinct words", () => {
    expect(parseStopwords("SI\nSÍ\nsi\nsi\u0301")).toEqual(new Set(["si", "sí"]));
  });

  it("applies shared token cleanup to entries", () => {
    expect(parseStopwords("'DON'T'\npor qué")).toEqual(new Set(["don't", "por", "qué"]));
  });
});

describe("getStopwords", () => {
  it("loads both bundled languages into one normalized set", () => {
    const stopwords = getStopwords();
    for (const word of ["the", "don't", "para", "también"]) {
      expect(stopwords.has(word)).toBe(true);
    }
    expect(stopwords.has("")).toBe(false);
    expect(stopwords.has("TAMBIÉN")).toBe(false);
    expect(stopwords.has("tambie\u0301n")).toBe(false);
  });

  it("defers parsing until first use and reuses the set without further tokenization", async () => {
    vi.resetModules();
    const tokenizer = await import("./Tokenizer.ts");
    const tokenizeSpy = vi.spyOn(tokenizer, "tokenize");

    try {
      const tokenFilter = await import("./TokenFilter.ts");
      expect(tokenizeSpy).not.toHaveBeenCalled();

      const first = tokenFilter.getStopwords();
      expect(tokenizeSpy).toHaveBeenCalledTimes(1);
      expect(tokenFilter.getStopwords()).toBe(first);
      expect(tokenFilter.getStopwords()).toBe(first);
      expect(tokenizeSpy).toHaveBeenCalledTimes(1);
    } finally {
      tokenizeSpy.mockRestore();
    }
  });
});

describe("filterTokens", () => {
  it("removes English and Spanish stopwords from mixed-language tokens", () => {
    expect(
      filterTokens(["the", "roadmap", "and", "reunión", "para", "desayuno", "también"]),
    ).toEqual(["roadmap", "reunión", "desayuno"]);
  });

  it("retains content words in their original order, including repeated occurrences", () => {
    expect(filterTokens(["roadmap", "desayuno", "roadmap"])).toEqual([
      "roadmap",
      "desayuno",
      "roadmap",
    ]);
  });

  it("preserves accented content words as distinct tokens", () => {
    expect(filterTokens(["café", "cafe", "résumé", "resume", "también", "más"])).toEqual([
      "café",
      "cafe",
      "résumé",
      "resume",
    ]);
  });

  it("returns no tokens for empty or entirely stopword input", () => {
    expect(filterTokens([])).toEqual([]);
    expect(filterTokens(["the", "with", "para", "también", "don't"])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const tokens = Object.freeze(["the", "café", "para", "café"]);
    expect(filterTokens(tokens)).toEqual(["café", "café"]);
    expect(tokens).toEqual(["the", "café", "para", "café"]);
  });

  it("requires at least three letters even for tokens absent from the stopword lists", () => {
    const tokens = ["é", "xy", "xyz"];
    for (const token of tokens) {
      expect(getStopwords().has(token)).toBe(false);
    }
    expect(filterTokens(tokens)).toEqual(["xyz"]);
  });

  it("counts accented letters once and does not count combining marks", () => {
    expect(filterTokens(["é", "éé", "été", "a\u0301b\u0301", "a\u0301b\u0301c\u0301"])).toEqual([
      "été",
      "a\u0301b\u0301c\u0301",
    ]);
  });

  it("does not count apostrophes toward the minimum", () => {
    expect(filterTokens(["i'm", "i’m", "x'y", "x’y", "x'y'z", "x’y’z", "john's"])).toEqual([
      "x'y'z",
      "x’y’z",
      "john's",
    ]);
  });

  it("does not count digits or symbols toward the minimum", () => {
    expect(filterTokens(["", "123", "😊", "3d", "q4", "ab123", "c++", "abc123"])).toEqual([
      "abc123",
    ]);
  });

  it("counts Unicode letters rather than UTF-16 code units", () => {
    expect(filterTokens(["猫", "猫狗", "猫狗鸟", "𐐨", "𐐨𐐩", "𐐨𐐩𐐪"])).toEqual(["猫狗鸟", "𐐨𐐩𐐪"]);
  });
});
