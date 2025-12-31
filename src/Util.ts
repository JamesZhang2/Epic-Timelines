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

/** Convert a decimal number in the range [0, 255] to a 2-digit hexadecimal number. */
function decimalTo2DigitHex(n: number) {
  if (n < 0 || n > 255) {
    throw new Error("Number is out of range of 2-digit hexes");
  }
  const hex = n.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

/** Convert RGB values to a color string (in the format #RRGGBB). */
export function rgbToColor(r: number, g: number, b: number) {
  return "#" + decimalTo2DigitHex(r) + decimalTo2DigitHex(g) + decimalTo2DigitHex(b);
}

/**
 * Make a new date from the date string but at local midnight
 * @param date format: yyyy-mm-dd
 */
export function dateAtLocalMidnight(date: string): Date {
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const result = regex.exec(date);
  if (!result) {
    throw new Error("Unexpected date format");
  }
  const year = parseInt(result[1]);
  const month = parseInt(result[2]);
  const day = parseInt(result[3]);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}
