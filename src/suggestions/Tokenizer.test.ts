import { describe, expect, it } from "vitest";
import { cleanPunctuation, normalizeText, removeUrls, tokenize } from "./Tokenizer.ts";

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

describe("cleanPunctuation", () => {
  it("replaces surrounding Unicode punctuation with spaces", () => {
    expect(cleanPunctuation("“¡Café!”（reunión）")).toBe("  Café   reunión ");
  });

  it("splits internal punctuation without merging words", () => {
    expect(cleanPunctuation("work/lunch,team-review—follow–up;one_two:three")).toBe(
      "work lunch team review follow up one two three",
    );
  });

  it("preserves straight and typographic apostrophe-s possessives", () => {
    expect(cleanPunctuation("John's María’s JAMES'S")).toBe("John's María’s JAMES'S");
    expect(cleanPunctuation("'John's'/‘María’s’")).toBe(" John's   María’s ");
  });

  it("preserves straight and typographic apostrophes between letters", () => {
    const text = "I'm I’m he's he’s don't don’t we'll we’ll l’été rock'n'roll John’smith";
    expect(cleanPunctuation(text)).toBe(text);
  });

  it("removes quotation apostrophes while preserving contractions inside them", () => {
    expect(cleanPunctuation("'I'm' ‘he’s’ 'don't'")).toBe(" I'm   he’s   don't ");
  });

  it("splits apostrophes without letters on both sides", () => {
    expect(cleanPunctuation("'s ’s 123's a'1 a’1 a' a’")).toBe(" s  s 123 s a 1 a 1 a  a ");
  });

  it("preserves apostrophes after decomposed accented letters", () => {
    expect(cleanPunctuation("Cafe\u0301's Cafe\u0301’s")).toBe("Cafe\u0301's Cafe\u0301’s");
  });

  it("combines normalization and cleanup without splitting contractions", () => {
    expect(cleanPunctuation(normalizeText("I'm/HE’S/John's"))).toBe("i'm he’s john's");
  });

  it("preserves accents and non-punctuation symbols", () => {
    expect(cleanPunctuation("café reunión C++ 😊")).toBe("café reunión C++ 😊");
  });

  it("handles empty, whitespace, and punctuation-only input", () => {
    expect(cleanPunctuation("")).toBe("");
    expect(cleanPunctuation(" \t\n")).toBe(" \t\n");
    expect(cleanPunctuation("!?…。/’")).toBe("      ");
  });

  it("keeps URL fragments out when URL removal precedes cleanup", () => {
    expect(
      cleanPunctuation(removeUrls("Review(https://example.com/team-room?q=agenda)today")),
    ).toBe("Review   today");
  });
});

describe("removeUrls", () => {
  it("removes HTTP and HTTPS URLs including paths, queries, and fragments", () => {
    expect(
      removeUrls("Join https://meet.example.com/team-room?user=ana&lang=es#agenda today"),
    ).toBe("Join   today");
    expect(removeUrls("Notes http://example.com/project_notes")).toBe("Notes  ");
  });

  it("removes multiple links, uppercase schemes, and www links", () => {
    expect(removeUrls("HTTPS://EXAMPLE.COM/a www.example.org/b HTTP://example.net/c")).toBe(
      "     ",
    );
  });

  it("preserves surrounding delimiters and adjacent title words", () => {
    expect(removeUrls("Review(https://example.com/agenda)today")).toBe("Review( )today");
    expect(removeUrls('Notes <https://example.com> "https://example.org" [www.example.net]')).toBe(
      'Notes < > " " [ ]',
    );
  });

  it("removes Unicode URLs without removing surrounding accented text", () => {
    expect(removeUrls("Reunión https://ejemplo.es/reunión?día=miércoles Café")).toBe(
      "Reunión   Café",
    );
  });

  it("handles links separated by tabs and newlines", () => {
    expect(removeUrls("https://example.com\tmeeting\nwww.example.org")).toBe(" \tmeeting\n ");
  });

  it("leaves empty input and text without URLs unchanged", () => {
    for (const text of ["", " \t\n", "John's work/lunch", "Café reunión", "www planning"]) {
      expect(removeUrls(text)).toBe(text);
    }
  });
});

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
    for (const text of ["", " \t\n\r\n\u00a0", "!?…。/’", "--- () ' ’"]) {
      expect(tokenize(text)).toEqual([]);
    }
  });

  it("normalizes mixed case and decomposed accents before splitting", () => {
    expect(tokenize("CAFE\u0301 ReUnIo\u0301N")).toEqual(["café", "reunión"]);
  });

  it("removes URLs before splitting their punctuation into words", () => {
    expect(tokenize("Review(https://example.com/team-room?q=agenda)today www.example.org")).toEqual(
      ["review", "today"],
    );
  });

  it("splits punctuation and preserves contractions and possessives", () => {
    expect(tokenize("'I'm'/HE’S—John's:l’été")).toEqual(["i'm", "he’s", "john's", "l’été"]);
  });

  it("preserves an unspaced Chinese phrase as one token", () => {
    expect(tokenize("项目规划会议")).toEqual(["项目规划会议"]);
    expect(tokenize("项目规划会议，团队讨论 café")).toEqual(["项目规划会议", "团队讨论", "café"]);
  });

  it("preserves repeated tokens in their original order", () => {
    expect(tokenize("Team review TEAM")).toEqual(["team", "review", "team"]);
  });
});
