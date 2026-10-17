import { describe, expect, it, vi } from "vitest";
import { getStopwords, parseStopwords } from "./TokenFilter.ts";

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
