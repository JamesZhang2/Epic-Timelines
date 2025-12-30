import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}

/** Parses an ICS string to CalendarEvents. */
export function parseICSToCalendarEvents(s: string): CalendarEvent[] {
  const jcalData = ICAL.parse(s);

  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");
  const icalEvents = vevents.map((e) => new ICAL.Event(e));

  const events = icalEvents.map(parseVEventToCalendarEvent);
  return events;
}

function parseVEventToCalendarEvent(event: ICAL.Event): CalendarEvent {
  // TODO: Deal with repeating events
  return {
    id: event.uid,
    title: event.summary,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    start: event.startDate.toJSDate(),
    end: event.endDate.toJSDate()
  }
}

/**
 * Returns true if the two intervals overlap nontrivially (more than 0), false otherwise.
 * Requires: start1 is strictly earlier than end1, start2 is strictly earlier than end2.
 */
export function hasNontrivialOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return computeOverlapHours(start1, end1, start2, end2) > 0;
}

/**
 * Returns the amount of overlap of the two intervals in hours.
 * Requires: start1 is strictly earlier than end1, start2 is strictly earlier than end2.
 */
export function computeOverlapHours(start1: Date, end1: Date, start2: Date, end2: Date): number {
  if (start1.getTime() >= end1.getTime()) {
    throw new Error("start1 must be strictly earlier than end1");
  }
  if (start2.getTime() >= end2.getTime()) {
    throw new Error("start2 must be strictly earlier than end2");
  }
  const laterStart = start1.getTime() > start2.getTime() ? start1 : start2;
  const earlierEnd = end1.getTime() < end2.getTime() ? end1 : end2;
  return Math.max(0, (earlierEnd.getTime() - laterStart.getTime()) / (3600 * 1000));
}

/** Convert a color string (in the format #RRGGBB) to a list of (r, g, b) values. */
export function colorToRGB(color: string): number[] {
  const regex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;
  const results = regex.exec(color);
  if (!results) {
    throw new Error("Color is not in the format #RRGGBB");
  }
  const r = parseInt(results[1], 16);
  const g = parseInt(results[2], 16);
  const b = parseInt(results[3], 16);
  return [r, g, b];
}
