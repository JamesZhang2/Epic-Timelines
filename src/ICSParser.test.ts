import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "./ICSParser";
import { parseICSToCalendarEvents, parseICSToCalendarEventsInRange } from "./ICSParser";
import * as fs from "fs";

function readIcs(file: string): string {
  return fs.readFileSync(`test/gcal/${file}.ics`, "utf-8");
}

/** Parses an ics file and sorts the events. */
function parseFile(file: string): CalendarEvent[] {
  const events = parseICSToCalendarEvents(readIcs(file));
  events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
  return events;
}

/** Parses an ics file with the given date range and sorts the events. */
function parseRange(file: string, start: string, end: string): CalendarEvent[] {
  const events = parseICSToCalendarEventsInRange(readIcs(file), new Date(start), new Date(end));
  events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime());
  return events;
}

describe("parseICSToCalendarEvents", () => {
  it("can parse events in 1 day", () => {
    const events = parseFile("1day-1");
    expect(events).toEqual([
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
    ]);
  });
});

describe("parseICSToCalendarEventsInRange", () => {
  it("repeat daily, range does not overlap with events", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-21T00:00:00.000Z",
      "2025-09-22T00:00:00.000Z",
    );
    expect(events).toEqual([]);

    const events2 = parseRange(
      "repeat-daily",
      "2025-09-23T00:01:00.000Z",
      "2025-09-23T00:02:00.000Z",
    );
    expect(events2).toEqual([]);
  });

  it("repeat daily for one day, start from the beginning", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-22T00:00:00.000Z",
      "2025-09-23T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily for one day, start in the middle", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T00:00:00.000Z",
      "2025-09-25T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily for multiple days, start in the middle", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T00:00:00.000Z",
      "2025-09-27T00:00:00.000Z",
    );
    expect(events).toEqual([
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
    ]);
  });

  it("repeat daily for multiple days, nonempty locations and descriptions", () => {
    const events = parseRange(
      "repeat-daily-location-description",
      "2025-09-24T00:00:00.000Z",
      "2025-09-27T00:00:00.000Z",
    );
    expect(events).toEqual([
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
    ]);
  });

  it("repeat daily - first occurrence partially overlaps with range", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T15:30:00.000Z",
      "2025-09-26T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:30:00.000Z"),
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
    ]);
  });

  it("repeat daily - edge case: first occurrence end equals startDate", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T16:00:00.000Z",
      "2025-09-26T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "577ctadpr97srgn09srgn451oq@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily - last occurrence partially overlaps with range", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T00:00:00.000Z",
      "2025-09-25T15:40:00.000Z",
    );
    expect(events).toEqual([
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
        end: new Date("2025-09-25T15:40:00.000Z"),
      },
    ]);
  });

  it("repeat daily - edge case: last occurrence start equals endDate", () => {
    const events = parseRange(
      "repeat-daily",
      "2025-09-24T00:00:00.000Z",
      "2025-09-26T15:00:00.000Z",
    );

    expect(events).toEqual([
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
    ]);
  });

  it("repeat daily until - endDate is before event end", () => {
    const events = parseRange(
      "repeat-daily-until",
      "2025-10-22T00:00:00.000Z",
      "2025-10-25T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-22T15:00:00.000Z"),
        end: new Date("2025-10-22T16:00:00.000Z"),
      },
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-23T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-23T15:00:00.000Z"),
        end: new Date("2025-10-23T16:00:00.000Z"),
      },
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-24T15:00:00.000Z"),
        end: new Date("2025-10-24T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily until - endDate is after event end", () => {
    const events = parseRange(
      "repeat-daily-until",
      "2025-10-24T00:00:00.000Z",
      "2025-10-29T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-24T15:00:00.000Z"),
        end: new Date("2025-10-24T16:00:00.000Z"),
      },
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-25T15:00:00.000Z"),
        end: new Date("2025-10-25T16:00:00.000Z"),
      },
      {
        id: "63pcini9qjasbi2va5b2mt2eqb@google.com-2025-10-26T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-26T15:00:00.000Z"),
        end: new Date("2025-10-26T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily with count", () => {
    const events = parseRange(
      "repeat-daily-with-count",
      "2025-09-22T00:00:00.000Z",
      "2025-09-25T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "4dh8fm0j83f9vc22dneoj64njp@google.com-2025-09-22T09:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T16:00:00.000Z"),
        end: new Date("2025-09-22T17:00:00.000Z"),
      },
      {
        id: "4dh8fm0j83f9vc22dneoj64njp@google.com-2025-09-23T09:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-23T16:00:00.000Z"),
        end: new Date("2025-09-23T17:00:00.000Z"),
      },
      {
        id: "4dh8fm0j83f9vc22dneoj64njp@google.com-2025-09-24T09:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T16:00:00.000Z"),
        end: new Date("2025-09-24T17:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily with count, range does not overlap with events", () => {
    const events = parseRange(
      "repeat-daily-with-count",
      "2025-09-21T00:00:00.000Z",
      "2025-09-22T00:00:00.000Z",
    );
    expect(events).toEqual([]);

    // With count = 42, the last occurrence is on Nov 2
    const events2 = parseRange(
      "repeat-daily-with-count",
      "2025-11-03T00:00:00.000Z",
      "2025-11-05T00:00:00.000Z",
    );
    expect(events2).toEqual([]);
  });

  it("repeat daily can punch one hole", () => {
    const events = parseRange(
      "repeat-daily-punch-one-hole",
      "2025-09-24T00:00:00.000Z",
      "2025-09-28T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-09-27T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-27T15:00:00.000Z"),
        end: new Date("2025-09-27T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily can punch many holes", () => {
    const events = parseRange(
      "repeat-daily-punch-many-holes",
      "2025-10-01T00:00:00.000Z",
      "2025-10-11T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-01T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-01T15:00:00.000Z"),
        end: new Date("2025-10-01T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-02T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-02T15:00:00.000Z"),
        end: new Date("2025-10-02T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-04T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-04T15:00:00.000Z"),
        end: new Date("2025-10-04T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-05T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-05T15:00:00.000Z"),
        end: new Date("2025-10-05T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-06T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-06T15:00:00.000Z"),
        end: new Date("2025-10-06T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-07T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-07T15:00:00.000Z"),
        end: new Date("2025-10-07T16:00:00.000Z"),
      },
      {
        id: "32ap7h4k22ntornnu1cv35dc5v@google.com-2025-10-10T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-10T15:00:00.000Z"),
        end: new Date("2025-10-10T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily can modify one occurrence", () => {
    const events = parseRange(
      "repeat-daily-modify-one-occurrence",
      "2025-09-23T00:00:00.000Z",
      "2025-09-26T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "5u5vu89a661kom4nlgese53tem@google.com-2025-09-23T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-23T15:00:00.000Z"),
        end: new Date("2025-09-23T16:00:00.000Z"),
      },
      {
        id: "5u5vu89a661kom4nlgese53tem@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T18:00:00.000Z"),
      },
      {
        id: "5u5vu89a661kom4nlgese53tem@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat daily can modify all later occurrences", () => {
    const events = parseRange(
      "repeat-daily-modify-all-later-occurrences",
      "2025-09-23T00:00:00.000Z",
      "2025-09-27T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "4iq5gmvj5u7ai1gqba4l72m7s3@google.com-2025-09-23T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-23T15:00:00.000Z"),
        end: new Date("2025-09-23T16:00:00.000Z"),
      },
      {
        id: "4iq5gmvj5u7ai1gqba4l72m7s3@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "g2l4e39qs75dl6qujrdvkrevdu@google.com-2025-09-25T12:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T19:00:00.000Z"),
        end: new Date("2025-09-25T20:00:00.000Z"),
      },
      {
        id: "g2l4e39qs75dl6qujrdvkrevdu@google.com-2025-09-26T12:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-26T19:00:00.000Z"),
        end: new Date("2025-09-26T20:00:00.000Z"),
      },
    ]);
  });

  it("repeat Mon Wed Fri until", () => {
    const events = parseRange(
      "repeat-Mon-Wed-Fri-until",
      "2025-09-22T00:00:00.000Z",
      "2025-09-28T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "13rhl03ua2dvc3r2vlbaicifse@google.com-2025-09-22T08:00:00",
        title: null,
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
      {
        id: "13rhl03ua2dvc3r2vlbaicifse@google.com-2025-09-24T08:00:00",
        title: null,
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "13rhl03ua2dvc3r2vlbaicifse@google.com-2025-09-26T08:00:00",
        title: null,
        description: undefined,
        location: undefined,
        start: new Date("2025-09-26T15:00:00.000Z"),
        end: new Date("2025-09-26T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat all weekdays", () => {
    const events = parseRange(
      "repeat-all-weekdays",
      "2025-09-22T00:00:00.000Z",
      "2025-09-28T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "7u2o9pbo9srbh60i6b98cmaack@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
      {
        id: "7u2o9pbo9srbh60i6b98cmaack@google.com-2025-09-23T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-23T15:00:00.000Z"),
        end: new Date("2025-09-23T16:00:00.000Z"),
      },
      {
        id: "7u2o9pbo9srbh60i6b98cmaack@google.com-2025-09-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-24T15:00:00.000Z"),
        end: new Date("2025-09-24T16:00:00.000Z"),
      },
      {
        id: "7u2o9pbo9srbh60i6b98cmaack@google.com-2025-09-25T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-25T15:00:00.000Z"),
        end: new Date("2025-09-25T16:00:00.000Z"),
      },
      {
        id: "7u2o9pbo9srbh60i6b98cmaack@google.com-2025-09-26T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-26T15:00:00.000Z"),
        end: new Date("2025-09-26T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat weekly", () => {
    const events = parseRange(
      "repeat-weekly",
      "2025-09-22T00:00:00.000Z",
      "2025-10-14T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "2govroup2229419vlf65jrs3dg@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
      {
        id: "2govroup2229419vlf65jrs3dg@google.com-2025-09-29T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-29T15:00:00.000Z"),
        end: new Date("2025-09-29T16:00:00.000Z"),
      },
      {
        id: "2govroup2229419vlf65jrs3dg@google.com-2025-10-06T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-06T15:00:00.000Z"),
        end: new Date("2025-10-06T16:00:00.000Z"),
      },
      {
        id: "2govroup2229419vlf65jrs3dg@google.com-2025-10-13T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-13T15:00:00.000Z"),
        end: new Date("2025-10-13T16:00:00.000Z"),
      },
    ]);
  });

  it("repeat monthly by day", () => {
    const events = parseRange(
      "repeat-monthly-by-day",
      "2025-09-01T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "7juaei7itn24vf22254gfl0tdu@google.com-2025-10-27T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-27T15:00:00.000Z"),
        end: new Date("2025-10-27T16:00:00.000Z"),
      },
      {
        id: "7juaei7itn24vf22254gfl0tdu@google.com-2025-11-24T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-11-24T16:00:00.000Z"),
        end: new Date("2025-11-24T17:00:00.000Z"),
      },
      {
        id: "7juaei7itn24vf22254gfl0tdu@google.com-2025-12-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-12-22T16:00:00.000Z"),
        end: new Date("2025-12-22T17:00:00.000Z"),
      },
    ]);
  });

  it("repeat monthly by monthday", () => {
    const events = parseRange(
      "repeat-monthly-by-monthday",
      "2025-09-01T00:00:00.000Z",
      "2025-12-01T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "481ajcu34peo411k33521d8ksa@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
      {
        id: "481ajcu34peo411k33521d8ksa@google.com-2025-10-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-10-22T15:00:00.000Z"),
        end: new Date("2025-10-22T16:00:00.000Z"),
      },
      {
        id: "481ajcu34peo411k33521d8ksa@google.com-2025-11-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-11-22T16:00:00.000Z"),
        end: new Date("2025-11-22T17:00:00.000Z"),
      },
    ]);
  });

  it("repeat annually", () => {
    const events = parseRange(
      "repeat-annually",
      "2025-01-01T00:00:00.000Z",
      "2027-01-01T00:00:00.000Z",
    );
    expect(events).toEqual([
      {
        id: "1irbkli3bmd1o2vqapd6bu04t4@google.com-2025-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T15:00:00.000Z"),
        end: new Date("2025-09-22T16:00:00.000Z"),
      },
      {
        id: "1irbkli3bmd1o2vqapd6bu04t4@google.com-2026-09-22T08:00:00",
        title: "Alpha",
        description: undefined,
        location: undefined,
        start: new Date("2026-09-22T15:00:00.000Z"),
        end: new Date("2026-09-22T16:00:00.000Z"),
      },
    ]);
  });
});
