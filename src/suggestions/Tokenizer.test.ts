import { describe, expect, it } from "vitest";
import { tokenize } from "./Tokenizer.ts";

describe("tokenize", () => {
  it("splits spaces, tabs, and newlines without emitting empty tokens", () => {
    expect(tokenize("  team\t\troadmap\nreview\r\n planning  ")).toEqual([
      "team",
      "roadmap",
      "review",
      "planning",
    ]);
  });

  it("splits Unicode whitespace", () => {
    expect(tokenize("café\u00a0reunión\u2003mañana\u3000equipo")).toEqual([
      "café",
      "reunión",
      "mañana",
      "equipo",
    ]);
  });

  it("returns no tokens for empty, whitespace-only, or punctuation-only input", () => {
    for (const text of ["", " \t\n\r\n\u00a0", "!?…。/’", "--- () ' ’", "<> << >>"]) {
      expect(tokenize(text)).toEqual([]);
    }
  });

  it("normalizes mixed case and decomposed accents before splitting", () => {
    expect(tokenize("CAFE\u0301 ReUnIo\u0301N")).toEqual(["café", "reunión"]);
    expect(tokenize("CAFÉ REUNIÓN AÑO")).toEqual(["café", "reunión", "año"]);
    expect(tokenize("CAFE\u0301 REUNIO\u0301N AN\u0303O")).toEqual(["café", "reunión", "año"]);
  });

  it("removes URLs before splitting their punctuation into words", () => {
    expect(tokenize("Review(https://example.com/team-room?q=agenda)today www.example.org")).toEqual(
      ["review", "today"],
    );
  });

  it("removes HTTP and HTTPS links with paths, queries, and fragments", () => {
    expect(
      tokenize("Join https://meet.example.com/team-room?user=ana&lang=es#agenda today"),
    ).toEqual(["join", "today"]);
    expect(tokenize("Notes http://example.com/project_notes")).toEqual(["notes"]);
  });

  it("removes multiple links with uppercase schemes and www prefixes", () => {
    expect(tokenize("HTTPS://EXAMPLE.COM/a www.example.org/b HTTP://example.net/c")).toEqual([]);
  });

  it("removes enclosed links and their delimiters while preserving words", () => {
    expect(tokenize('Notes <https://example.com> "https://example.org" [www.example.net]')).toEqual(
      ["notes"],
    );
  });

  it("removes Unicode URLs while preserving surrounding accented words", () => {
    expect(tokenize("Reunión https://ejemplo.es/reunión?día=miércoles Café")).toEqual([
      "reunión",
      "café",
    ]);
  });

  it("removes links separated by tabs and newlines", () => {
    expect(tokenize("https://example.com\tmeeting\nwww.example.org")).toEqual(["meeting"]);
  });

  it("keeps www when it is a word rather than a link prefix", () => {
    expect(tokenize("www planning")).toEqual(["www", "planning"]);
  });

  it("splits punctuation and preserves contractions and possessives", () => {
    expect(tokenize("'I'm'/HE’S—John's:l’été")).toEqual(["i'm", "he's", "john's", "l'été"]);
  });

  it("splits surrounding Unicode punctuation", () => {
    expect(tokenize("“¡Café!”（reunión）")).toEqual(["café", "reunión"]);
  });

  it("treats angle brackets as separators without merging adjacent words", () => {
    expect(tokenize("<Roadmap>review>planning<today")).toEqual([
      "roadmap",
      "review",
      "planning",
      "today",
    ]);
  });

  it("splits internal punctuation without merging words", () => {
    expect(tokenize("work/lunch,team-review—follow–up;one_two:three")).toEqual([
      "work",
      "lunch",
      "team",
      "review",
      "follow",
      "up",
      "one",
      "two",
      "three",
    ]);
  });

  it("normalizes both apostrophe styles between letters to straight apostrophes", () => {
    expect(
      tokenize("I'm I’m he's he’s don't don’t we'll we’ll l’été rock'n'roll John’smith"),
    ).toEqual([
      "i'm",
      "i'm",
      "he's",
      "he's",
      "don't",
      "don't",
      "we'll",
      "we'll",
      "l'été",
      "rock'n'roll",
      "john'smith",
    ]);
    expect(tokenize("John's María’s JAMES'S")).toEqual(["john's", "maría's", "james's"]);
  });

  it("removes quotation apostrophes while preserving contractions and possessives", () => {
    expect(tokenize("'I'm' ‘he’s’ 'don't' 'John's' ‘María’s’")).toEqual([
      "i'm",
      "he's",
      "don't",
      "john's",
      "maría's",
    ]);
  });

  it("splits apostrophes without letters on both sides and discards numeric fragments", () => {
    expect(tokenize("'s ’s 123's a'1 a’1 a' a’")).toEqual(["s", "s", "s", "a", "a", "a", "a"]);
  });

  it("preserves possessives after decomposed accented letters", () => {
    expect(tokenize("Cafe\u0301's Cafe\u0301’s")).toEqual(["café's", "café's"]);
  });

  it("preserves accents and non-punctuation symbols", () => {
    expect(tokenize("café reunión C++ 😊")).toEqual(["café", "reunión", "c++", "😊"]);
  });

  it("preserves an unspaced Chinese phrase as one token", () => {
    expect(tokenize("项目规划会议")).toEqual(["项目规划会议"]);
    expect(tokenize("项目规划会议，团队讨论 café")).toEqual(["项目规划会议", "团队讨论", "café"]);
  });

  it("preserves repeated tokens in their original order", () => {
    expect(tokenize("Team review TEAM")).toEqual(["team", "review", "team"]);
  });

  it("discards numeric-only tokens among words", () => {
    expect(tokenize("2026 roadmap 123 review 0 007")).toEqual(["roadmap", "review"]);
  });

  it("discards Unicode numeric-only tokens", () => {
    expect(tokenize("１２３ ١٢٣ १२३ ½ Ⅻ café")).toEqual(["café"]);
  });

  it("discards numeric fragments produced by punctuation cleanup", () => {
    expect(tokenize("Review 1,000 3.14 2026-10-15 09:30")).toEqual(["review"]);
  });

  it("retains tokens containing both words and numbers", () => {
    expect(tokenize("Q4 project2026 3D café2 versión２")).toEqual([
      "q4",
      "project2026",
      "3d",
      "café2",
      "versión２",
    ]);
  });

  it("returns no tokens for numeric-only input", () => {
    expect(tokenize("0 42 １２３")).toEqual([]);
  });
});
