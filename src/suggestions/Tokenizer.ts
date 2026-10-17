/** Turns input strings (calendar event titles) into tokens. */

/** Shared text normalization for suggestion tokens and stopword entries. */
function normalizeText(text: string): string {
  return text.normalize("NFC").toLowerCase();
}

/** Remove web links before punctuation cleanup can turn their parts into words. */
function removeUrls(text: string): string {
  return text.replace(/\b(?:https?:\/\/|www\.)[^\s<>"'“”‘’()[\]{}]+/giu, " ");
}

/** Split punctuation, retaining apostrophes between letters (including accents). */
function cleanPunctuation(text: string): string {
  return text.replace(
    /(?<=\p{L}\p{M}*)(['’])(?=\p{L})|\p{P}/gu,
    (_punctuation, internalApostrophe: string | undefined) => internalApostrophe ?? " ",
  );
}

/** Clean and split title text, discarding empty and numeric-only tokens. */
export function tokenize(text: string): string[] {
  const cleaned = cleanPunctuation(removeUrls(normalizeText(text)));
  return cleaned.split(/\s+/u).filter((token) => token.length > 0 && !/^\p{N}+$/u.test(token));
}
