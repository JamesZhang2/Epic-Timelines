import { describe, expect, it } from "vitest";
import { filterTokens } from "./TokenFilter.ts";

describe("filterTokens", () => {
  it("removes English and Spanish stopwords from mixed-language tokens", () => {
    expect(
      filterTokens(["the", "roadmap", "and", "reunión", "para", "desayuno", "también", "don't"]),
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
