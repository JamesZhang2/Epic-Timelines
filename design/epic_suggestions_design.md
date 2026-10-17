# Epic suggestions (beta)

## Goal and scope

Help users discover useful Epic keywords from their calendar, then review and edit
each suggestion before creating an Epic. The first version uses word frequency,
English and Spanish stopwords, and local browser processing only.

## First-pass design

- Add a separate, full-width **Epic suggestions (beta)** foldable section below
  the row containing `AddEpicCard` and `OptionsCard`. Start collapsed and generate
  suggestions when first expanded, using `EpicTimelines`' filtered `events` and
  respecting the applied date range and Ignore all-day events option. Each expanded
  recurring occurrence counts as an event.
  Do not run tokenization, filtering, counting, or ranking before first expansion.
- Use an accessible disclosure (e.g. native `details`/`summary`). Inside, explain
  the title-only analysis and show multiple suggestions with their word, occurrence
  count, and review action. Cache computed results and pagination while collapsed.
  Reopening with unchanged inputs reuses the cache without recomputation or refresh.
- Initially, analyze titles only: descriptions often contain boilerplate and meeting
  links. Created suggestions therefore default to matching titles only.
- Normalize Unicode to NFC and turn words to lowercase without removing accents.
  Remove URLs before punctuation cleanup, replace Unicode punctuation with spaces
  except for straight (`'`) and typographic (`’`) apostrophes between letters, then
  split on whitespace and discard empty and numeric-only tokens.
  This also removes internal punctuation: `work/lunch` becomes `work` and `lunch`,
  rather than merging them into `worklunch`. Preserve possessives and contractions
  as single tokens (e.g. `John's` → `john's`, `I'm` → `i'm`, `he’s` → `he’s`).
  Surrounding quotation apostrophes still become spaces; common contractions can
  be filtered by the stopword lists.
- Filter against the union of bundled English and Spanish stopword lists. Acquire
  these during development, record their source/version and license in a section in
  `README.md`, and ship them with the app. No language detection or runtime downloads
  are needed.
- Also filter out tokens containing two or fewer Unicode letters, even when absent
  from the stopword lists. Count letters rather than UTF-16 code units; accents
  do not add letters, and apostrophes, digits, and other symbols do not count.
  For example, discard `go`, `sí`, `I'm`, and `3D`, but retain `sol` and `café`
  unless they are stopwords.
- Count total token occurrences across titles. Keep candidates appearing at least
  `minFrequency` times (default: 2); sort by descending count, then deterministic
  lexical order for ties. Return all qualifying candidates; the UI initially shows
  `suggestionsPerPage` results (default: 10).
- Expose **Minimum frequency** and **Suggestions per page** numeric inputs in the
  foldable section. Use uncontrolled inputs and an Apply button with submit-time
  validation: both values must be positive safe integers with reasonable bounds. Applying valid values
  refreshes results; invalid values show an error and leave applied settings and
  results unchanged. Keep these settings in session state for the beta, outside
  `TimelineOptions` and the version-1 config format.
- Return suggestion data (word and count), separate from `Epic` objects. Use a pure
  `suggestEpicKeywords(events, options)` entry point in `src/suggestions/EpicSuggestions.ts`
  so the ranking and filtering can be tested independently of React.
  Export a `SuggestionOptions` type and shared defaults from this module; validate
  supplied values at the engine boundary as well as in the UI.
- Add **Show more suggestions** below the list to append the next
  `suggestionsPerPage` unseen, non-dismissed candidates in ranked order. Append a
  smaller final batch if necessary, and hide the button when no candidates remain.
  This reveals more of the ranked list without recounting events.
- Give each suggestion an **Ignore** action with an accessible label identifying
  the word. Remove it from view and record its normalized word in a session-only
  dismissed set; do not delete calendar events or existing Epics. Do not auto-fill
  the removed row: Show more remains the explicit way to reveal more candidates.
  Keep dismissals across event changes, date-range changes, calendar uploads,
  regeneration, applied-setting changes, and collapse/reopen. Store them only in
  memory for the app session; closing/reopening or reloading the app may lose them.
  Include **Reset ignored
  suggestions** to clear the set and restart from the first batch.
- Show each word and its occurrence count, with an action to populate the existing
  Add Epic form. Prefill name, an escaped literal regex keyword, case-insensitive
  matching, and title-only matching; retain the form's current color. The user can
  edit values and must click Add to create the Epic. Explain that existing regex
  matching can also match the keyword inside longer words.
- Reuse the existing add handler and unique-name checks. Prefilling another
  suggestion replaces the current draft, so ask for confirmation if the form has
  unsaved edits. Do not change existing Epics or their display order.
- Invalidate suggestions when the source events change; regenerate immediately if
  expanded, or on next expansion if collapsed. Show a helpful empty state when no
  candidates qualify.
  Track the calendar/event input, applied range, all-day filter, and relevant
  applied suggestion settings for cache validity. Changes while collapsed only
  mark the cache stale; they must not trigger suggestion computation. Unrelated
  renders and timeline display options must not invalidate the cache.
  Regeneration or applying settings resets pagination to the first batch while
  retaining dismissals. If all qualifying candidates are ignored, explain this
  and offer Reset ignored suggestions.
- Suggestions are temporary UI state; accepted Epics use normal config persistence.

## Module boundaries

Keep the suggestion engine in its own `src/suggestions/` directory:

- `EpicSuggestions.ts`: public entry point, suggestion/options types, shared defaults,
  option validation, minimum-frequency filtering, and ranking. Pagination and
  dismissal operate on the returned list in the UI; the engine does not truncate it.
- `Tokenizer.ts`: text normalization, whitespace tokenization, and token cleanup.
- `TokenFilter.ts`: parse stopword text and filter tokens using an in-memory set
  plus the minimum-letter-count rule.
- `FrequencyCounter.ts`: count token occurrences independently of ranking.
- `data/stopwords-en.txt` and `data/stopwords-es.txt`: UTF-8 word lists, one word per
  line, with source/license attribution alongside them. Import as bundled raw text
  and parse once into a shared set; no runtime fetch or filesystem access. Trim
  lines, ignore blank lines, normalize as for tokens, and deduplicate entries.
  Future dictionaries can also live in `data/`.
- Colocated `*.test.ts` files for the engine and text-processing helpers.

The engine accepts calendar events and returns suggestion data without mutating
inputs. It may import shared domain types but has no React, DOM, file-download,
or persistence dependencies. Its internal text-processing modules stay private
to the feature; UI code calls the public entry point.

Suggestion UI belongs in `src/ui/EpicSuggestionsCard.tsx`. `EpicTimelines` supplies events already filtered
by date and the all-day option, owns temporary suggestion state, and passes accepted
drafts to `AddEpicCard`. Conversion to an Epic draft (including literal regex
escaping) happens at this integration boundary, keeping counting/filtering
independent of Epic creation and form behavior.

## Testing plan

Use colocated Vitest tests and complete red–green–refactor cycles for small features:
write a test and observe an assertion failure, implement enough to pass, then
refactor while keeping tests green. Repeat within each feature as needed. Each
prepared commit includes its tests and implementation and ends with passing tests;
do not split failing tests and their implementation into separate commits.

- **Tokenizer:** spaces, tabs, and newlines; empty/whitespace input; mixed case;
  composed/decomposed accented characters; punctuation-only input; surrounding and
  internal Unicode punctuation (including hyphens, apostrophes, and slashes);
  possessives and contractions preserved with straight and typographic apostrophes
  between letters; surrounding quotation apostrophes removed;
  punctuation separating words without merging them; URLs removed before cleanup
  so their fragments do not become candidates; numeric-only tokens.
  Include Chinese text to document that an unspaced phrase stays one token.
- **Filtering and list parsing:** English and Spanish stopwords, mixed-language
  input, retained content words, accent preservation, empty lists/input, duplicate
  entries, blank lines, and LF/CRLF files. Use small inline text fixtures for parser
  tests and a smoke test with the bundled lists to verify both languages load.
  Cover the minimum-letter-count boundary with non-stopword tokens of one, two,
  and three letters, accented letters, contractions, digits, and Unicode letters.
- **Frequency counter:** exact counts for repeated tokens within one title and
  across events, single occurrences, empty input, and distinct accented words.
  Verify input arrays are unchanged.
- **Suggestion pipeline:** mixed English/Spanish event fixtures with explicit
  expected words/counts; title-only analysis; minimum-count boundaries; descending
  counts and deterministic tie ordering; default and custom frequency thresholds;
  all qualifying candidates returned; rejection of zero, negative, fractional, non-finite, and unsafe
  integer options; no qualifying words;
  repeated occurrences supplied as separate events; unchanged input events.
  The engine consumes already-filtered events, so date/all-day filtering remains
  the caller's responsibility.
- **Epic draft conversion:** regex metacharacters become literal matches, with
  case-insensitive and title-only defaults. Verify this separately from counting.
- **UI/manual checks:** placement below both cards, keyboard-accessible expand/collapse,
  multiple suggestions and counts, generation and empty state, invalidation after date/all-day
  changes, draft review/edit/add, cancellation of draft replacement, duplicate-name
  rejection, and persistence of accepted Epics without temporary suggestions.
  Verify defaults of 2/10, custom settings applied only on submit, invalid settings
  preserving results, and applied settings retained across collapse/reopen.
  Cover successive batches without duplicates, partial final batches, exhausted
  results, ignoring visible rows without auto-fill, ignored words excluded from
  later batches and regeneration, reset behavior, and the all-ignored empty state.
  Verify zero engine calls before first expansion, no extra calls on unchanged
  collapse/reopen, deferred computation for input changes while collapsed, and
  refresh on expansion after invalidation. Verify dismissed words stay excluded
  after event/range changes and calendar uploads for the lifetime of the app session.
  Unit-test any extracted pure pagination/dismissal helpers through their own
  red–green–refactor cycle.

## Known limitations and later improvements

- Whitespace splitting does not segment Chinese text; add Chinese segmentation later.
- Raw frequency favors repeated words and recurring meetings. Consider counting a
  word once per event, ranking by overlap hours, or grouping recurring series.
- Add phrase detection, stemming/lemmatization, selectable source fields, and custom
  stopwords.
- Much later, outside the initial beta scope: use a bundled English–Spanish
  dictionary to group words/phrases by semantic meaning before counting (e.g.
  `desayuno` and `breakfast` contribute to one concept). Preserve the original
  terms so the suggested Epic can match both languages with regex alternatives.
  Account for ambiguous translations and context rather than merging every
  dictionary translation automatically; keep dictionary lookup local.
- Suppress candidates already represented by existing Epics; arbitrary regex rules
  make semantic deduplication a separate problem.

## Implementation tasks

Work through the task groups below in order, preparing small feature commits from
their subtasks. Complete red–green–refactor for each logic subtask using its coverage
in the testing plan. Create modules under `src/suggestions/` as they become needed.
Leave changes uncommitted for user review.

For every prepared commit (each subtask), run the full unit test suite, build, and lint after
completing its changes; resolve failures before moving on to the next feature.
Keep logic/data changes separate from UI changes in these commit-sized units.
This verification applies throughout implementation, not only at the end.

Mark the subtask/task as done in the commit that completes it.

- [x] Tokenization and data cleaning.
  - [x] Normalize Unicode to NFC and lowercase words while preserving accents;
        cover composed/decomposed characters and mixed case.
  - [x] Remove URLs before punctuation cleanup so URL fragments never become
        candidates.
  - [x] Split surrounding and internal Unicode punctuation into spaces without
        merging words (e.g. `work/lunch` → `work`, `lunch`).
  - [x] Preserve straight and typographic apostrophes between letters so possessives
        and contractions remain one token (e.g. `John's` → `john's`, `I'm` → `i'm`,
        `he’s` → `he’s`); remove surrounding quotation apostrophes.
  - [x] Split on whitespace, handling spaces, tabs, newlines, empty input, and
        punctuation-only input without emitting empty tokens.
  - [x] Discard numeric-only tokens while retaining words containing numbers.
  - [x] Cover unspaced Chinese text, preserving a whole phrase as one token;
        segmentation remains outside the beta scope.
- [x] Stopword filtering.
  - [x] Select compatible English and Spanish sources; record their versions,
        licenses, and attribution alongside the data and in `README.md`.
  - [x] Bundle UTF-8 `.txt` lists as raw text imports with no runtime downloads.
  - [x] Parse LF/CRLF lists: trim lines, ignore blanks, normalize entries as for
        tokens, and deduplicate. Cover empty lists and duplicate entries.
  - [x] Load both lists once into a shared in-memory set; smoke-test that both
        bundled languages contribute entries.
  - [x] Filter tokens against the union; cover mixed-language input, retained
        content words, accent preservation, and empty input.
  - [x] Filter out tokens with two or fewer Unicode letters independently of
        stopword membership; test one/two/three-letter boundaries, accents,
        contractions, digits, and Unicode letters.
- [x] Frequency counting.
  - [x] Count every token occurrence, including repeated words within one title
        and across events.
  - [x] Cover empty input, single occurrences, and distinct accented words;
        verify input arrays remain unchanged.
- [ ] Suggestion pipeline.
  - [x] Define the public suggestion/options types and shared defaults (minimum
        frequency 2, suggestions per page 10).
  - [x] Define reasonable option bounds and shared validation for both options;
        reject zero, negative, fractional, non-finite, unsafe, and out-of-bounds
        values. Bounds: minimum frequency 1–1,000,000; suggestions per page 1–100.
  - [ ] Compose title extraction, tokenization, stopword filtering, and counting
        in the pure `suggestEpicKeywords(events, options)` entry point; validate
        both options at this engine boundary before processing events.
  - [ ] Apply the minimum-frequency threshold; cover default/custom thresholds,
        exact boundaries, and no qualifying words.
  - [ ] Rank by descending count with deterministic lexical ties; return every
        qualifying candidate without pagination or dismissal logic.
  - [ ] Verify the full pipeline with mixed English/Spanish fixtures, title-only
        analysis, recurring occurrences supplied as separate events, and unchanged
        input events. Keep date/all-day filtering in the caller.
- [ ] Epic draft conversion.
  - [ ] Escape regex metacharacters so suggested words become literal keywords;
        verify the resulting regex matches the literal text.
  - [ ] Set the name and case-insensitive, title-only defaults without choosing
        a new color. Keep conversion separate from counting and UI wiring.
- [ ] Foldable beta section.
  - [ ] Add `EpicSuggestionsCard` below both existing cards as a full-width,
        initially collapsed, keyboard-accessible disclosure.
  - [ ] Explain title-only analysis, occurrence counts, and regex matching inside
        longer words.
  - [ ] Connect first expansion to the engine using `EpicTimelines`' already
        filtered events; do no suggestion processing before expansion.
  - [ ] Render words, counts, and review actions; expose a draft callback for
        the later Add Epic form integration.
  - [ ] Show a helpful empty state when no candidates meet the threshold.
- [ ] Suggestion settings.
  - [ ] Add uncontrolled Minimum frequency and Suggestions per page inputs with
        shared defaults and an Apply button.
  - [ ] Validate both values on submit using the shared bounds; show errors and
        preserve applied settings/results when invalid.
  - [ ] Keep applied settings in session state outside `TimelineOptions` and
        config persistence; retain them across collapse/reopen.
  - [ ] Refresh results and reset pagination only after a valid Apply.
- [ ] Dismissal and pagination.
  - [ ] Implement pure helpers for selecting the first batch and appending unseen,
        non-dismissed candidates in ranked order; cover no duplicates, partial
        final batches, and exhaustion through TDD before UI wiring.
  - [ ] Own the normalized dismissed-word set in session state independently of
        cached results; preserve it across regeneration, settings/range changes,
        calendar uploads, and collapse/reopen.
  - [ ] Add Ignore actions with word-specific accessible labels; remove rows
        without auto-filling or changing calendar events or Epics.
  - [ ] Add Show more suggestions using the applied batch size; append without
        recounting events and hide the button when candidates are exhausted.
  - [ ] Add Reset ignored suggestions to clear dismissals and restart at the
        first batch; distinguish the all-ignored empty state and offer reset.
- [ ] Lazy generation and cache invalidation.
  - [ ] Track cache validity using calendar/event input, applied range, all-day
        filtering, and relevant applied suggestion settings.
  - [ ] Regenerate immediately after relevant changes while expanded; reset
        pagination and retain dismissals.
  - [ ] Mark results stale after relevant changes while collapsed, deferring all
        computation until the next expansion.
  - [ ] Reuse cached results and pagination on unchanged collapse/reopen; ignore
        unrelated renders and timeline display option changes.
  - [ ] Verify engine call counts for first expansion, unchanged reopening,
        changes while collapsed, and expansion after invalidation.
- [ ] Add Epic form integration.
  - [ ] Connect review actions to draft conversion and prefill uncontrolled
        `AddEpicCard` inputs while retaining the current color.
  - [ ] Detect unsaved edits and confirm before replacing a draft; cancellation
        must preserve the current form values.
  - [ ] Validate edited regex keywords on submit and require an explicit Add;
        reuse the existing add handler and unique-name checks.
  - [ ] Verify review/edit/add and repeated prefilling without changing existing
        Epics or their display order.
- [ ] Manual integration verification.
  - [ ] Check placement, keyboard disclosure controls, counts, settings, and both
        empty states using a small calendar fixture.
  - [ ] Check date/all-day filtering, recurring occurrences, and calendar uploads
        with both expanded and collapsed suggestions.
  - [ ] Check successive batches, Ignore without auto-fill, retained dismissals,
        reset, and exhausted results.
  - [ ] Check draft review/edit/add, regex errors, duplicate-name rejection, and
        cancellation of draft replacement.
  - [ ] Save/load accepted Epics through normal config persistence; confirm
        temporary suggestions, settings, and dismissals are not saved.
