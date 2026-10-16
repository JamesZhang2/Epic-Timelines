# Epic suggestions (beta)

## Goal and scope

Help users discover useful Epic keywords from their calendar, then review and edit
each suggestion before creating an Epic. The first version uses word frequency,
English and Spanish stopwords, and local browser processing only.

## First-pass design

- Add a **Suggest Epics (beta)** action near the Add Epic card. Generate suggestions
  on demand from `EpicTimelines`' filtered `events`, respecting the applied date
  range and Ignore all-day events option. Each expanded recurring occurrence counts
  as an event.
- Analyze titles only initially: descriptions often contain boilerplate and meeting
  links. Created suggestions therefore default to matching titles only.
- Normalize Unicode to NFC and lowercase without removing accents. Split on
  whitespace, strip leading/trailing punctuation, and discard empty tokens,
  numeric-only tokens, and URLs. Preserve internal punctuation.
- Filter against the union of bundled English and Spanish stopword lists. Acquire
  these during development, record their source/version and license, and ship
  them with the app. No language detection or runtime downloads are needed.
- Count total token occurrences across titles. Keep candidates appearing at least
  twice; sort by descending count, then deterministic lexical order for ties, and
  show at most 10. Keep thresholds/constants in the suggestion utility.
- Return suggestion data (word and count), separate from `Epic` objects. Use a pure
  `suggestEpicKeywords(events)` helper in `src/utils/EpicSuggestions.ts` so the ranking
  and filtering can be tested independently of React.
- Show each word and its occurrence count, with an action to populate the existing
  Add Epic form. Prefill name, an escaped literal regex keyword, case-insensitive
  matching, and title-only matching; retain the form's current color. The user can
  edit values and must click Add to create the Epic. Explain that existing regex
  matching can also match the keyword inside longer words.
- Reuse the existing add handler and unique-name checks. Prefilling another
  suggestion replaces the current draft, so ask for confirmation if the form has
  unsaved edits. Do not change existing Epics or their display order.
- Clear displayed suggestions when the source events change, and require another
  click to regenerate. Show a helpful empty state when no candidates qualify.
  Suggestions are temporary UI state; accepted Epics use normal config persistence.

## Known limitations and later improvements

- Whitespace splitting does not segment Chinese text; add Chinese segmentation later.
- Raw frequency favors repeated words and recurring meetings. Consider counting a
  word once per event, ranking by overlap hours, or grouping recurring series.
- Add phrase detection, stemming/lemmatization, selectable source fields, custom
  stopwords, and dismissal of unwanted suggestions.
- Much later, outside the initial beta scope: use a bundled English–Spanish
  dictionary to group words/phrases by semantic meaning before counting (e.g.
  `desayuno` and `breakfast` contribute to one concept). Preserve the original
  terms so the suggested Epic can match both languages with regex alternatives.
  Account for ambiguous translations and context rather than merging every
  dictionary translation automatically; keep dictionary lookup local.
- Suppress candidates already represented by existing Epics; arbitrary regex rules
  make semantic deduplication a separate problem.

## Implementation tasks

- [ ] Select compatible English/Spanish stopword sources; bundle lists and attribution.
- [ ] Write and run failing unit tests for normalization, stopwords in both languages,
      accents, punctuation, URLs/numbers, empty input, frequency thresholds, stable
      ordering, result limits, recurring occurrences, and literal regex escaping.
- [ ] Implement the pure suggestion and regex-escaping helpers; make tests pass.
- [ ] Add the beta action, suggestion list/counts, and empty state; invalidate results
      when the filtered event input changes.
- [ ] Add draft prefilling to `AddEpicCard`, including unsaved-edit confirmation and
      submit-time regex validation. Keep inputs uncontrolled and creation explicit.
- [ ] Manually verify date/all-day filtering, review/edit/add, duplicate-name errors,
      draft cancellation, and save/load of accepted Epics without suggestion data.
- [ ] Run unit tests, build, and lint; keep logic/data changes separate from UI changes
      when preparing commits, and leave changes uncommitted for review.
