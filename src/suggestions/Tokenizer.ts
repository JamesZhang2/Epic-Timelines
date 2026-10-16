/** Shared text normalization for suggestion tokens and stopword entries. */
export function normalizeText(text: string): string {
  return text.normalize("NFC").toLowerCase();
}

/** Remove web links before punctuation cleanup can turn their parts into words. */
export function removeUrls(text: string): string {
  return text.replace(/\b(?:https?:\/\/|www\.)[^\s<>"'“”‘’()[\]{}]+/giu, " ");
}
