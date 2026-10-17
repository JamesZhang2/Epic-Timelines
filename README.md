# Epic Timelines

This project is inspired by the Jira timelines for Epics. It allows you to import your calendar files (.ics) and track how various activities (the "Epics" in your personal life) appear on your calendars over time.

## Getting Started

### Dependencies

- First install Node.js: `brew install node`. `npm` should be included in Node.js.
- ical.js: `npm install ical.js`
- vitest: `npm install -D vitest`

### Running the Project

- `npm run dev` followed by `o` to open the webpage
- `npm run test` to run the Vitest suites

## Privacy Notice

All the data processing is done locally on your computer, and the project can be run offline. No data (such as your calendar events) is collected or stored.

## Epic suggestion stopword sources

The Epic suggestions feature selects the English and Spanish collections from
[stopwords-iso](https://github.com/stopwords-iso/stopwords-iso). Both list repositories
declare version **0.3.0** and use the **MIT license**, copyright (c) 2016 Gene Diaz.
Exact revisions are pinned so future upstream edits do not silently change suggestions:

| Language | Source list                                                                                                                      | Revision                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| English  | [stopwords-en.txt](https://github.com/stopwords-iso/stopwords-en/blob/ccc8898188850d8fb019d5f69c14a6635c3bd115/stopwords-en.txt) | `ccc8898188850d8fb019d5f69c14a6635c3bd115` |
| Spanish  | [stopwords-es.txt](https://github.com/stopwords-iso/stopwords-es/blob/622c17231fa0e164026de886f2bb8b2e5f0ac825/stopwords-es.txt) | `622c17231fa0e164026de886f2bb8b2e5f0ac825` |

Source selection and attribution are complete; bundling and filtering are upcoming
implementation subtasks. The lists will ship as local UTF-8 text assets without
runtime downloads or an npm dependency. Calendar processing remains local.
See [data attribution](src/suggestions/data/README.md) and the
[upstream license notice](src/suggestions/data/LICENSE.stopwords-iso.txt).
