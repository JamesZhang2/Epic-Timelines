import { describe, expect, it } from "vitest";
import { DEFAULT_SUGGESTION_OPTIONS, validateSuggestionOptions } from "./EpicSuggestions.ts";

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
