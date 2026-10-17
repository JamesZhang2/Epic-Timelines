import { describe, expect, it } from "vitest";
import { countTokenFrequencies } from "./FrequencyCounter.ts";

describe("countTokenFrequencies", () => {
  it("counts repeated tokens within a title and across event titles", () => {
    const firstTitle = ["roadmap", "review", "roadmap"];
    const secondTitle = ["review", "roadmap", "planning"];

    expect(countTokenFrequencies([...firstTitle, ...secondTitle])).toEqual(
      new Map([
        ["roadmap", 3],
        ["review", 2],
        ["planning", 1],
      ]),
    );
  });

  it("counts single occurrences", () => {
    expect(countTokenFrequencies(["planning", "review"])).toEqual(
      new Map([
        ["planning", 1],
        ["review", 1],
      ]),
    );
  });

  it("returns an empty map for empty input", () => {
    expect(countTokenFrequencies([])).toEqual(new Map());
  });

  it("counts distinct accented words separately", () => {
    expect(countTokenFrequencies(["café", "cafe", "résumé", "resume", "café", "résumé"])).toEqual(
      new Map([
        ["café", 2],
        ["cafe", 1],
        ["résumé", 2],
        ["resume", 1],
      ]),
    );
  });

  it("does not mutate the input array", () => {
    const tokens = Object.freeze(["review", "roadmap", "review"]);

    expect(countTokenFrequencies(tokens)).toEqual(
      new Map([
        ["review", 2],
        ["roadmap", 1],
      ]),
    );
    expect(tokens).toEqual(["review", "roadmap", "review"]);
  });
});
