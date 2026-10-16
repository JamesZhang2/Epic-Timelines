/** Shared text normalization for suggestion tokens and stopword entries. */
export function normalizeText(text: string): string {
  return text.normalize("NFC").toLowerCase();
}
