# Stopword data attribution

The English and Spanish sources selected for Epic suggestions are the
[stopwords-iso](https://github.com/stopwords-iso/stopwords-iso) collections by Gene Diaz
and contributors. Both repositories declare package version **0.3.0**. Commit
revisions below identify the exact snapshots to copy in the bundling subtask.

| Intended local file | Pinned upstream file                                                                                                                   | Revision                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `stopwords-en.txt`  | [English list](https://raw.githubusercontent.com/stopwords-iso/stopwords-en/ccc8898188850d8fb019d5f69c14a6635c3bd115/stopwords-en.txt) | `ccc8898188850d8fb019d5f69c14a6635c3bd115` |
| `stopwords-es.txt`  | [Spanish list](https://raw.githubusercontent.com/stopwords-iso/stopwords-es/622c17231fa0e164026de886f2bb8b2e5f0ac825/stopwords-es.txt) | `622c17231fa0e164026de886f2bb8b2e5f0ac825` |

Both sources use the MIT license, copyright (c) 2016 Gene Diaz. Their identical
license notice is retained in [LICENSE.stopwords-iso.txt](LICENSE.stopwords-iso.txt).
Pinned upstream notices: [English license](https://github.com/stopwords-iso/stopwords-en/blob/ccc8898188850d8fb019d5f69c14a6635c3bd115/LICENSE)
and [Spanish license](https://github.com/stopwords-iso/stopwords-es/blob/622c17231fa0e164026de886f2bb8b2e5f0ac825/LICENSE).
The upstream [source credits](https://github.com/stopwords-iso/stopwords-iso#credits)
describe the collections' contributing sources.

The next subtask will copy the UTF-8 files unchanged and import them as bundled raw
text. Parsing and normalization will happen in memory; no runtime network access,
filesystem access, or upstream npm package is required. Keep this attribution and
the license notice with the copied data, and update the pinned revisions if the
lists are deliberately refreshed.
