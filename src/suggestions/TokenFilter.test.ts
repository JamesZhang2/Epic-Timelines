import { describe, expect, it } from "vitest";
import { parseStopwords } from "./TokenFilter.ts";

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
