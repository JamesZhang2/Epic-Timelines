import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "./ICSParser";
import { parseICSToCalendarEvents, parseICSToCalendarEventsInRange } from "./ICSParser";
import * as fs from "fs";

describe("parseICSToCalendarEvents", () => {
  it("can parse events in 1 day", () => {
    const raw: string = fs.readFileSync("test/gcal/1day-1.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEvents(raw);
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
    const expected: CalendarEvent[] = [
      {
        id: "5cfjrj5lrsig8qst3psdhjtkdm@google.com",
        title: "Breakfast",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-21T15:00:00.000Z"),
        end: new Date("2025-09-21T16:00:00.000Z"),
      },
      {
        id: "7tu57hmj1rmmn80vchetafoge2@google.com",
        title: "Lunch",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-21T19:00:00.000Z"),
        end: new Date("2025-09-21T20:00:00.000Z"),
      },
      {
        id: "2q8pt3qink4he7p3o84acmjfu7@google.com",
        title: "Dinner",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T01:00:00.000Z"),
        end: new Date("2025-09-22T02:00:00.000Z"),
      },
    ];
    expect(events).toEqual(expected);
  });
});

describe("parseICSToCalendarEventsInRange", () => {
  it("repeat daily for one day, start from the beginning", () => {
    const raw: string = fs.readFileSync("test/gcal/repeat-daily.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEventsInRange(
      raw,
      new Date("2025-09-22T00:00:00.000Z"),
      new Date("2025-09-23T00:00:00.000Z"),
    );
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
    const expected: CalendarEvent[] = [
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
    ];
    expect(events).toEqual(expected);
  });

  it("repeat daily for one day, start in the middle", () => {
    const raw: string = fs.readFileSync("test/gcal/repeat-daily.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEventsInRange(
      raw,
      new Date("2025-09-24T00:00:00.000Z"),
      new Date("2025-09-25T00:00:00.000Z"),
    );
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
    const expected: CalendarEvent[] = [
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
    ];
    expect(events).toEqual(expected);
  });

  it("repeat daily for multiple days, start in the middle", () => {
    const raw: string = fs.readFileSync("test/gcal/repeat-daily.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEventsInRange(
      raw,
      new Date("2025-09-24T00:00:00.000Z"),
      new Date("2025-09-27T00:00:00.000Z"),
    );
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
    const expected: CalendarEvent[] = [
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-26T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-26T15:00:00.000Z"),
        end: new Date("2025-09-26T16:00:00.000Z"),
      },
    ];
    expect(events).toEqual(expected);
  });

  it("repeat daily for multiple days, nonempty locations and descriptions", () => {
    const raw: string = fs.readFileSync("test/gcal/repeat-daily-location-description.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEventsInRange(
      raw,
      new Date("2025-09-24T00:00:00.000Z"),
      new Date("2025-09-27T00:00:00.000Z"),
    );
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
    const expected: CalendarEvent[] = [
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: "Description A",
        location: "Location A",
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: "Description A",
        location: "Location A",
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-26T08:00:00",
        title: "Alpha",
        description: "Description A",
        location: "Location A",
        start: new Date("2025-09-26T15:00:00.000Z"),
        end: new Date("2025-09-26T16:00:00.000Z"),
      },
    ];
    expect(events).toEqual(expected);
  });
});
