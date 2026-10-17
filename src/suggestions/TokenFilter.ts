import { tokenize } from "./Tokenizer.ts";
import { englishStopwordText, spanishStopwordText } from "./data/Stopwords.ts";

let stopwords: ReadonlySet<string> | undefined;

/** Normalize newline-delimited stopwords using the same cleanup as title tokens. */
export function parseStopwords(text: string): Set<string> {
  return new Set(tokenize(text));
}

/** Lazily parse the bundled lists once, sharing their union across engine calls. */
export function getStopwords(): ReadonlySet<string> {
  stopwords ??= parseStopwords(`${englishStopwordText}\n${spanishStopwordText}`);
  return stopwords;
}
