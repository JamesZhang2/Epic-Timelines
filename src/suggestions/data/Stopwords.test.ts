import { describe, expect, it } from "vitest";
import { englishStopwordText, spanishStopwordText } from "./Stopwords.ts";

describe("bundled stopword text", () => {
  it("includes English stopwords and contractions as raw text", () => {
    expect(englishStopwordText).toMatch(/^the$/m);
    expect(englishStopwordText).toMatch(/^don't$/m);
  });

  it("includes Spanish stopwords with UTF-8 accents intact", () => {
    expect(spanishStopwordText).toMatch(/^para$/m);
    expect(spanishStopwordText).toMatch(/^también$/m);
    expect(spanishStopwordText).not.toContain("\uFFFD");
  });
});
