import { tokenize } from "./Tokenizer.ts";

/** Normalize newline-delimited stopwords using the same cleanup as title tokens. */
export function parseStopwords(text: string): Set<string> {
  return new Set(tokenize(text));
}
