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
- `src/EpicTimelines.tsx`: top-level “app” logic once events are loaded (epics/options/buckets/selection)
- `src/BucketUtil.ts`: bucket generation, event bucketing, and hours aggregation
- `src/EventUtil.ts`: event filtering and epic-to-event matching helpers
- `src/Timelines.tsx`: table composition (header + rows + optional details row)
- `src/TimelineHeader.tsx`: bucket labels
- `src/TimelineRow.tsx`: per-epic row rendering + heatmap coloring
- `src/AddEpicCard.tsx`: create epic form (uncontrolled inputs; submit-time validation)
- `src/OptionsCard.tsx`: timeline options form (uncontrolled inputs; submit-time validation)
- `src/EpicDetails.tsx`: selected epic details + edit/delete (includes delete confirmation timeout)
- `src/Util.ts`: overlap math, color helpers, local-midnight date parsing
- Tests:
  - `src/BucketUtil.test.ts`, `src/EventUtil.test.ts`, `src/ICSParser.test.ts`, `src/Util.test.ts`
  - Sample ICS fixtures live under `test/...` (used by tests)

## Core domain types (source of truth: `src/EpicTimelines.tsx`)

- `CalendarEvent` (`src/ICSParser.ts`): `{ id, title, description?, location?, start, end }`
- `Epic`: `{ name (unique), keyword (regex string), caseSensitive, color, matchTitle, matchDescription, matchLocation }`
- `TimeBucket`: `{ start: Date, end: Date }`
- `TimelineOptions`: `{ startDate, endDate, bucketGranularity, showBucketHours, ignoreAllDayEvents }`

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
- **Epic names must be unique**: enforced in `EpicTimelines` when adding/editing.
- **Epics match via regex**:
  - `keyword` is compiled with `new RegExp(keyword, caseSensitive ? "" : "i")`.
  - Matches selected fields only (title/description/location).
  - Invalid regex strings will throw at runtime; treat keyword as a regex, not a plain substring.

## UX conventions used throughout

- Forms use **uncontrolled inputs** + **submit-time validation** (not continuous “live” validation):
  - `AddEpicCard`, `OptionsCard`, and edit mode in `EpicDetails`
- Deleting an epic is a 2-step confirm within a short timeout (`EpicDetails`).

## Known limitations / TODOs

- `EpicTimelines.tsx` currently renders a debug `<pre>` of all parsed events.
- Read `TODO.md` for a list of planned features/changes

## When making changes: quick test plan

- Run `npm test` (Vitest)
- Manually:
  - Upload a small `.ics`, verify events appear in computed buckets
  - Try a recurring `.ics` event and confirm occurrences appear only within the selected range
  - Toggle "Ignore all-day events" and confirm events 24 hours or longer are excluded/included as expected
  - Add an Epic with a simple regex and confirm hours aggregation matches expectations
  - Try month/year bucket edge cases (e.g., starting on the 31st)
  - Edit + delete epic flows (including delete confirmation timeout)
