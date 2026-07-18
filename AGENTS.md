# Epic Timelines

Agent briefing for working on this repo. Keep changes aligned with the app's time/UX semantics.

## What this app does

Epic Timelines is a local-first React + TypeScript web app inspired by Jira timelines for Epics.

Users:

- Upload an exported calendar `.ics` file
- Define "Epics" (regex-based rules) that match subsets of events
- Visualize time spent per Epic across configurable time buckets (day/week/month/3-month/year) as a timeline heatmap table

High-level pipeline:

1. `.ics` → parsed into `CalendarEvent[]` (based on start and end dates of user options)
2. Optionally filter ignored events (for example, all-day events)
3. Generate `TimeBucket[]` from user options
4. Bucket events by overlap with each bucket
5. For each Epic, sum **overlap hours** of matching events per bucket
6. Render a table: epics as rows, buckets as columns, color density by relative hours

## DOs and DON'Ts

- DO write tests for backend production code. DO use test-driven development (TDD) when applicable, especially when writing backend logic code. Write the tests, run them, see them fail (failure to build doesn't count), then implement the production code and run the tests. Continue to fix the production code until the tests pass.
- DO write small, targeted commits that are easy to review. DO separate the frontend changes from the backend changes. DO NOT write one large end-to-end commit that both add UI elements and implement a complicated backend feature (one that requires unit tests).
- DO NOT commit changes on behalf of the user. Leave them uncommitted in the working tree for the user to review.

## Privacy / data handling

- All processing happens locally in the browser.
- No networking is required for normal use; calendar data is not sent anywhere by the app.

## Stack

- React 19, TypeScript, Vite
- ICS parsing: `ical.js`
- Tests: Vitest
- Lint/format: ESLint + Prettier

## Common commands

- `npm run dev`: start dev server
- `npm run build`: typecheck + build
- `npm run preview`: preview built app
- `npm run test`: run Vitest
- `npm run lint`: eslint + prettier check
- `npm run lint:fix`: eslint fix + prettier write

## Repo layout (important files)

- `src/App.tsx`: file upload UI; reads `.ics` into text and parses events
- `src/ICSParser.ts`: converts ICS text → `CalendarEvent[]`, including expanded recurring event occurrences in range
- `src/EpicTimelines.tsx`: top-level “app” logic once events are loaded (epics/options/buckets/selection/reordering/config save-load)
- `src/BucketUtil.ts`: bucket generation, event bucketing, and hours aggregation
- `src/ConfigPersistence.ts`: versioned JSON save/load serialization and validation for Epics + Timeline Options
- `src/EventUtil.ts`: event filtering and epic-to-event matching helpers
- `src/Timelines.tsx`: table composition (header + rows + optional details row; optional reorder columns)
- `src/TimelineHeader.tsx`: bucket labels + optional reorder column labels
- `src/TimelineRow.tsx`: per-epic row rendering + heatmap coloring + optional reorder buttons
- `src/AddEpicCard.tsx`: create epic form (uncontrolled inputs; submit-time validation)
- `src/OptionsCard.tsx`: timeline options form (uncontrolled inputs; submit-time validation)
- `src/SaveLoadCard.tsx`: JSON config save/load UI for Epics and Options only
- `src/EpicDetails.tsx`: selected epic details + edit/delete (includes delete confirmation timeout)
- `src/Util.ts`: overlap math, color helpers, local-midnight date parsing
- Tests:
  - `src/BucketUtil.test.ts`, `src/ConfigPersistence.test.ts`, `src/EventUtil.test.ts`, `src/ICSParser.test.ts`, `src/Util.test.ts`
  - Sample ICS fixtures live under `test/...` (used by tests)

## Core domain types (source of truth: `src/EpicTimelines.tsx`)

- `CalendarEvent` (`src/ICSParser.ts`): `{ id, title, description?, location?, start, end }`
- `Epic`: `{ name (unique), keyword (regex string), caseSensitive, color, matchTitle, matchDescription, matchLocation }`
- `TimeBucket`: `{ start: Date, end: Date }`
- `TimelineOptions`: `{ startDate, endDate, bucketGranularity, showBucketHours, ignoreAllDayEvents, useGlobalColor, useGlobalScale, globalColor }`

## Key semantics & invariants (do not break)

- **Local date semantics**: options UI treats chosen start/end as **local midnight** via `dateAtLocalMidnight("yyyy-mm-dd")`.
- **Bucket generation**:
  - Buckets advance from the chosen `startDate` forward; they do **not** snap to calendar boundaries.
  - Month/year buckets use **anchor-day semantics** with clamp-to-last-day-of-month for invalid days.
- **Overlap math**:
  - Hours are computed from timestamp overlap and may be fractional.
  - Overlap requires strict interval ordering (`start < end`) and uses `[start, end)`-style math (see `computeOverlapHours`).
- **Recurring events**: `ICSParser.ts` expands recurring ICS events into individual `CalendarEvent` occurrences within the selected range.
- **Ignoring all-day events**:
  - `TimelineOptions.ignoreAllDayEvents` defaults to `true`.
  - When enabled, `EpicTimelines` filters out events whose parsed span is greater than or equal to 24 hours before bucketing.
- **Timeline heatmap color and scale**:
  - Per-Epic shading is the default: each Epic row uses `Epic.color` and scales cell darkness by that Epic's own max bucket hours.
  - `TimelineOptions.useGlobalColor` overrides all timeline cell base colors with `TimelineOptions.globalColor`, but does not overwrite any `Epic.color`.
  - `TimelineOptions.useGlobalScale` scales all timeline cell darkness by the global max bucket hours across every Epic and bucket.
  - Global color and global scale are independent options: users can enable either one without the other.
  - `getTimelineScaleMaxHours` intentionally throws if the provided global max is smaller than the current Epic row max.
- **Epic names must be unique**: enforced in `EpicTimelines` when adding/editing.
- **Config persistence**:
  - Save/load is a local JSON browser-file flow for Epics and Timeline Options only; it never saves parsed calendar events or the uploaded `.ics` data.
  - Config files are versioned (`version: 1`) and store `epics` in display order plus the complete `timelineOptions` object.
  - Saved `startDate`/`endDate` values are `yyyy-mm-dd` strings; loading converts them back through `dateAtLocalMidnight` to preserve local-midnight semantics.
  - Loading validates the entire file before mutating state: supported version, top-level shape, valid options, unique valid Epics, valid colors, at least one match field, and regex keywords that compile.
  - A failed or cancelled load leaves the current Epics and Options unchanged. A successful load replaces Epics and Options, clears the selected Epic, exits reorder mode, and remounts `OptionsCard` so uncontrolled defaults reflect loaded values.
- **Epic order is user-controlled**:
  - `EpicTimelines` owns the `epics` array order and reorders it with `setEpics`.
  - Reordering swaps neighboring Epics only; first-row up and last-row down actions are disabled in the UI.
- **Epics match via regex**:
  - `keyword` is compiled with `new RegExp(keyword, caseSensitive ? "" : "i")`.
  - Matches selected fields only (title/description/location).
  - Invalid regex strings will throw at runtime; treat keyword as a regex, not a plain substring.

## UX conventions used throughout

- Forms use **uncontrolled inputs** + **submit-time validation** (not continuous “live” validation):
  - `AddEpicCard`, `OptionsCard`, and edit mode in `EpicDetails`
  - Narrow exception: `OptionsCard` may use local React state for immediate UI changes on the `OptionsCard` itself, such as disabling/enabling the global color picker, while still applying option values only on submit.
- Deleting an epic is a 2-step confirm within a short timeout (`EpicDetails`).
- Epic reordering is a table mode toggled below the timelines table:
  - Button text is `Reorder Epics` when inactive and `Done` when active.
  - Reorder columns/buttons are shown only while reordering.
  - Visible controls use `↑` and `↓` characters with accessible `aria-label`s.
- Save/load UI uses browser-native file APIs and `alert`/`confirm`, matching the app's current submit-time validation style.

## TODOs

- Read `TODO.md` for a list of planned features/changes

## When making changes: quick test plan

- Run `npm test` (Vitest)
- Persistence has focused unit coverage in `src/ConfigPersistence.test.ts`. End-to-end save/load interaction tests are intentionally omitted for now because they require mocking browser file/download and confirmation interactions.
- Manually:
  - Upload a small `.ics`, verify events appear in computed buckets
  - Try a recurring `.ics` event and confirm occurrences appear only within the selected range
  - Toggle "Ignore all-day events" and confirm events 24 hours or longer are excluded/included as expected
  - Add an Epic with a simple regex and confirm hours aggregation matches expectations
  - Toggle "Use global color" and confirm timeline cells use the global color without changing Epic colors
  - Toggle "Use global scale" and confirm cell darkness is scaled against the max bucket hours across all Epics
  - Add several Epics, toggle reorder mode, move Epics up/down, and verify first/last boundary buttons are disabled
  - Save a config JSON and load it back, confirming Epics, Options, global color/global scale, and Epic order are restored
  - Try cancelling a valid config load and loading an invalid config, confirming existing Epics and Options remain unchanged
  - Try month/year bucket edge cases (e.g., starting on the 31st)
  - Edit + delete epic flows (including delete confirmation timeout)
