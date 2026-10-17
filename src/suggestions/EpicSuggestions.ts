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
