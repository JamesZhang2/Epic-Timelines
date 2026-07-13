/** This file contains helper functions for dealing with calendar events. */

import type { Epic } from "./Timelines.types";
import type { CalendarEvent } from "./ICSParser";

const ALL_DAY_EVENT_MIN_DURATION_MS = 24 * 60 * 60 * 1000;

/** Filters out events whose time span is at least 24 hours. */
export function filterOutAllDayEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(
    (event) => event.end.getTime() - event.start.getTime() < ALL_DAY_EVENT_MIN_DURATION_MS,
  );
}

/**
 * @returns true if the Epic matches the event (taking into account case sensitivity
 * and which fields to match), false otherwise.
 */
export function epicMatchesEvent(epic: Epic, event: CalendarEvent) {
  const regex = new RegExp(epic.keyword, epic.caseSensitive ? "" : "i"); // i: ignore case flag
  if (epic.matchTitle && regex.test(event.title)) {
    return true;
  }
  if (epic.matchDescription && event.description !== undefined && regex.test(event.description)) {
    return true;
  }
  if (epic.matchLocation && event.location !== undefined && regex.test(event.location)) {
    return true;
  }
  return false;
}
