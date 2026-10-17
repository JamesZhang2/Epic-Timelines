/** Count every occurrence of already-cleaned tokens, without ranking them. */
export function countTokenFrequencies(tokens: readonly string[]): Map<string, number> {
  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return frequencies;
}
