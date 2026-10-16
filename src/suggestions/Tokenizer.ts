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
