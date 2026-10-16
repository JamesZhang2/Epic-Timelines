/** Shared text normalization for suggestion tokens and stopword entries. */
export function normalizeText(text: string): string {
  return text.normalize("NFC").toLowerCase();
}

/** Remove web links before punctuation cleanup can turn their parts into words. */
export function removeUrls(text: string): string {
  return text.replace(/\b(?:https?:\/\/|www\.)[^\s<>"'“”‘’()[\]{}]+/giu, " ");
}

/** Split punctuation, retaining apostrophes between letters (including accents). */
export function cleanPunctuation(text: string): string {
  return text.replace(
    /(?<=\p{L}\p{M}*)(['’])(?=\p{L})|\p{P}/gu,
    (_punctuation, internalApostrophe: string | undefined) => internalApostrophe ?? " ",
  );
}

/** Clean title text and split on whitespace without segmenting unspaced languages. */
export function tokenize(text: string): string[] {
  const cleaned = cleanPunctuation(removeUrls(normalizeText(text)));
  return cleaned.split(/\s+/u).filter((token) => token.length > 0);
}
