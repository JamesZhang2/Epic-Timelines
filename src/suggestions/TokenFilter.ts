import { tokenize } from "./Tokenizer.ts";
import { englishStopwordText, spanishStopwordText } from "./data/Stopwords.ts";

let stopwords: ReadonlySet<string> | undefined;

/** Normalize newline-delimited stopwords using the same cleanup as title tokens. */
function parseStopwords(text: string): Set<string> {
  return new Set(tokenize(text));
}

/** Lazily parse the bundled lists once, sharing their union across engine calls. */
function getStopwords(): ReadonlySet<string> {
  stopwords ??= parseStopwords(`${englishStopwordText}\n${spanishStopwordText}`);
  return stopwords;
}

/** Remove stopwords and tokens with fewer than three letters, preserving occurrences. */
export function filterTokens(tokens: readonly string[]): string[] {
  const stopwords = getStopwords();
  return tokens.filter((token) => {
    const letterCount = token.match(/\p{L}/gu)?.length ?? 0;
    return letterCount >= 3 && !stopwords.has(token);
  });
}
