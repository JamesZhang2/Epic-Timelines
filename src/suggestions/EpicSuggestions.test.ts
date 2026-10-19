import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../utils/ICSParser.ts";
import {
  DEFAULT_SUGGESTION_OPTIONS,
  suggestEpicKeywords,
  validateSuggestionOptions,
} from "./EpicSuggestions.ts";

describe("validateSuggestionOptions", () => {
  it("accepts the shared defaults", () => {
    expect(() => validateSuggestionOptions(DEFAULT_SUGGESTION_OPTIONS)).not.toThrow();
  });

  describe.each([
    { field: "minFrequency", label: "Minimum frequency", max: 1_000_000 },
    { field: "suggestionsPerPage", label: "Suggestions per page", max: 100 },
  ] as const)("$field", ({ field, label, max }) => {
    it.each([1, 7, max])("accepts the in-bounds integer %s", (value) => {
      const options = { ...DEFAULT_SUGGESTION_OPTIONS, [field]: value };
      expect(() => validateSuggestionOptions(options)).not.toThrow();
    });

    it.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, max + 1])(
      "rejects %s with a field-specific error",
      (value) => {
        const options = { ...DEFAULT_SUGGESTION_OPTIONS, [field]: value };
        expect(() => validateSuggestionOptions(options)).toThrow(
          `${label} must be an integer between 1 and ${max}.`,
        );
      },
    );
  });

  it("does not mutate valid options", () => {
    const options = Object.freeze({ minFrequency: 3, suggestionsPerPage: 20 });
    validateSuggestionOptions(options);
    expect(options).toEqual({ minFrequency: 3, suggestionsPerPage: 20 });
  });

  it("does not change either option when validation fails", () => {
    const options = Object.freeze({ minFrequency: 3, suggestionsPerPage: 0 });
    expect(() => validateSuggestionOptions(options)).toThrow();
    expect(options).toEqual({ minFrequency: 3, suggestionsPerPage: 0 });
  });
});

describe("suggestEpicKeywords", () => {
  function eventWithTitle(title: string): CalendarEvent {
    return {
      id: title,
      title,
      start: new Date(2026, 9, 16, 9),
      end: new Date(2026, 9, 16, 10),
    };
  }

  const options = { ...DEFAULT_SUGGESTION_OPTIONS, minFrequency: 1 };

  it("normalizes, cleans, filters, and counts title tokens across events", () => {
    const events = [
      eventWithTitle("CAFE\u0301/ROADMAP roadmap and the https://example.com/agenda 123 xy"),
      eventWithTitle("Reunión para CAFÉ ROADMAP review"),
    ];

    expect(suggestEpicKeywords(events, options)).toEqual([
      { word: "roadmap", count: 3 },
      { word: "café", count: 2 },
      { word: "reunión", count: 1 },
      { word: "review", count: 1 },
    ]);
  });

  it("combines apostrophe variants in counts and removes contractions in either style", () => {
    const events = [eventWithTitle("John's don't"), eventWithTitle("John’s don’t")];

    expect(suggestEpicKeywords(events, options)).toEqual([{ word: "john's", count: 2 }]);
  });

  it("analyzes titles without counting descriptions or locations", () => {
    const event = {
      ...eventWithTitle("Roadmap roadmap"),
      description: "roadmap budget budget",
      location: "roadmap office office",
    };

    expect(suggestEpicKeywords([event], options)).toEqual([{ word: "roadmap", count: 2 }]);
  });

  it("returns no suggestions for empty event input", () => {
    expect(suggestEpicKeywords([])).toEqual([]);
  });

  it("returns no suggestions when titles contain no content words", () => {
    const events = [eventWithTitle(""), eventWithTitle("the and para sí xy 123 !!!")];
    expect(suggestEpicKeywords(events, options)).toEqual([]);
  });

  describe("ranking", () => {
    it("breaks ties by locale-independent lexical order regardless of event order", () => {
      const events = [eventWithTitle("éclair zulu"), eventWithTitle("café cafe")];
      const expected = [
        { word: "cafe", count: 1 },
        { word: "café", count: 1 },
        { word: "zulu", count: 1 },
        { word: "éclair", count: 1 },
      ];

      expect(suggestEpicKeywords(events, options)).toEqual(expected);
      expect(suggestEpicKeywords([...events].reverse(), options)).toEqual(expected);
    });

    // TODO: Change this when we support pagination.
    it.each([1, 10])(
      "returns all qualifying words when the page size is %s",
      (suggestionsPerPage) => {
        const words = [
          "aardvark",
          "bear",
          "cat",
          "dog",
          "elephant",
          "fish",
          "goat",
          "hare",
          "iguana",
          "jaguar"
        ];
        const title = words.join(" ");
        const events = [eventWithTitle(`${title} ${title}`)];

        expect(
          suggestEpicKeywords(events, { ...DEFAULT_SUGGESTION_OPTIONS, suggestionsPerPage }),
        ).toEqual(words.map((word) => ({ word, count: 2 })));
      },
    );
  });

  describe("minimum frequency", () => {
    const events = [eventWithTitle("roadmap roadmap roadmap review review planning")];

    it("defaults to two occurrences, including the cutoff and excluding single occurrences", () => {
      expect(suggestEpicKeywords(events)).toEqual([
        { word: "roadmap", count: 3 },
        { word: "review", count: 2 },
      ]);
    });

    it.each([
      {
        minFrequency: 1,
        expected: [
          { word: "roadmap", count: 3 },
          { word: "review", count: 2 },
          { word: "planning", count: 1 },
        ],
      },
      { minFrequency: 3, expected: [{ word: "roadmap", count: 3 }] },
      { minFrequency: 4, expected: [] },
    ])(
      "returns only words occurring at least $minFrequency times",
      ({ minFrequency, expected }) => {
        const suggestions = suggestEpicKeywords(events, { ...options, minFrequency });

        expect(suggestions).toEqual(expected);
      },
    );
  });
});
