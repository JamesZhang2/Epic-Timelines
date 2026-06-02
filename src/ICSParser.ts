import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

/** Parses an ICS string to CalendarEvents in a given range. */
export function parseICSToCalendarEventsInRange(
  s: string,
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  const jcalData = ICAL.parse(s);

  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");
  const icalEvents = vevents.map((e) => new ICAL.Event(e));

  const events = icalEvents
    .map((e) => parseICALEventToCalendarEventsInRange(e, startDate, endDate))
    .flat();
  return events;
}

/**
 * Parses a (possibly recurrent) ICAL event to a list of CalendarEvents in a given range.
 */
function parseICALEventToCalendarEventsInRange(
  event: ICAL.Event,
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  const expansion: ICAL.RecurExpansion = event.iterator();

  const events: CalendarEvent[] = [];

  // Note that next is the start time of the next occurrence of the event.
  for (let next = expansion.next(); next; next = expansion.next()) {
    const details = event.getOccurrenceDetails(next);
    if (details.startDate.toJSDate() >= endDate) {
      // This and future occurrences are all past the range
      break;
    }
    if (details.endDate.toJSDate() <= startDate) {
      // This occurrence is completely before the range
      continue;
    }

    const eventStart =
      details.startDate.toJSDate() < startDate ? startDate : details.startDate.toJSDate();
    const eventEnd = details.endDate.toJSDate() > endDate ? endDate : details.endDate.toJSDate();

    const item = details.item;
    events.push({
      id: event.uid + "-" + details.recurrenceId,
      title: item.summary,
      description: item.description ?? undefined,
      location: item.location ?? undefined,
      start: eventStart,
      end: eventEnd,
    });
  }
  return events;
}
