import { describe, expect, it } from "vitest";
import { normalizeText, removeUrls } from "./Tokenizer.ts";

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
