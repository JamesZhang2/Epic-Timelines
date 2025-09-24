import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}

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
    description: event.description,
    location: event.location,
    start: event.startDate.toJSDate(),
    end: event.endDate.toJSDate()
  }
}