import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

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
    end: event.endDate.toJSDate(),
  };
}

/** Parses an ICS string to CalendarEvents in a given range. */
export function parseICSToCalendarEventsInRange(
  s: string,
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  const jcalData = ICAL.parse(s);

  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");
  const icalEvents = vevents
    .map((e) => new ICAL.Event(e))
  // TODO: Filter out recurrence exceptions

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
  for (let next: ICAL.Time | null = expansion.next(); next !== null; next = expansion.next()) {
    const details = event.getOccurrenceDetails(next);
    const item = details.item;
    events.push({
      id: event.uid,
      title: item.summary,
      description: undefined,
      location: undefined,
      start: details.startDate.toJSDate(),
      end: details.endDate.toJSDate(),
    });
    break;
  }
  return events;
}
