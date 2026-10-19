import type { CalendarEvent } from "../utils/ICSParser.ts";
import { countTokenFrequencies } from "./FrequencyCounter.ts";
import { filterTokens } from "./TokenFilter.ts";
import { tokenize } from "./Tokenizer.ts";

/** A candidate keyword and its total token occurrences across event titles. */
export type EpicSuggestion = {
  word: string;
  count: number;
};

/** Session-only suggestion settings, separate from timeline options and config files. */
export type SuggestionOptions = {
  minFrequency: number;
  suggestionsPerPage: number;
};

/** Shared defaults for the suggestion engine and UI. */
export const DEFAULT_SUGGESTION_OPTIONS: Readonly<SuggestionOptions> = Object.freeze({
  minFrequency: 2,
  suggestionsPerPage: 10,
});

/** Allow high occurrence thresholds while keeping UI page sizes manageable. */
export const SUGGESTION_OPTION_BOUNDS = {
  minFrequency: { min: 1, max: 1_000_000 },
  suggestionsPerPage: { min: 1, max: 100 },
} as const;

/** Shared submit-time and engine validation; throws without changing options. */
export function validateSuggestionOptions(options: Readonly<SuggestionOptions>): void {
  for (const field of ["minFrequency", "suggestionsPerPage"] as const) {
    const value = options[field];
    const { min, max } = SUGGESTION_OPTION_BOUNDS[field];
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      const label = field === "minFrequency" ? "Minimum frequency" : "Suggestions per page";
      throw new Error(`${label} must be an integer between ${min} and ${max}.`);
    }
  }
}

/**
 * Outputs title-word counts meeting the minimum frequency.
 * The caller handles date and all-day event filtering.
 */
export function suggestEpicKeywords(
  events: readonly CalendarEvent[],
  options: Readonly<SuggestionOptions> = DEFAULT_SUGGESTION_OPTIONS,
): EpicSuggestion[] {
  validateSuggestionOptions(options);
  const tokens = events.flatMap((event) => tokenize(event.title));
  const frequencies = countTokenFrequencies(filterTokens(tokens));
  return Array.from(frequencies, ([word, count]) => ({ word, count })).filter(
    (suggestion) => suggestion.count >= options.minFrequency,
  );
}
