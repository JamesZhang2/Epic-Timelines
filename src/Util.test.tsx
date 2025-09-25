import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "./Util";
import { parseICSToCalendarEvents, hasNontrivialOverlap } from "./Util";
import * as fs from "fs";

describe("parseICSToCalendarEvents", () => {
  it("can parse events in 1 day", () => {
    const raw: string = fs.readFileSync("test/gcal/1day-1.ics", "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEvents(raw);
    events.sort((e1, e2) => e1.start.getTime() - e2.start.getTime())
    const expected: CalendarEvent[] = [
      {
        id: "5cfjrj5lrsig8qst3psdhjtkdm@google.com",
        title: "Breakfast",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-21T15:00:00.000Z"),
        end: new Date("2025-09-21T16:00:00.000Z")
      },
      {
        id: "7tu57hmj1rmmn80vchetafoge2@google.com",
        title: "Lunch",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-21T19:00:00.000Z"),
        end: new Date("2025-09-21T20:00:00.000Z")
      },
      {
        id: "2q8pt3qink4he7p3o84acmjfu7@google.com",
        title: "Dinner",
        description: undefined,
        location: undefined,
        start: new Date("2025-09-22T01:00:00.000Z"),
        end: new Date("2025-09-22T02:00:00.000Z")
      }
    ]
    expect(events).toEqual(expected);
    console.log(events);
  });
});

describe("hasNontrivialOverlap", () => {
  it("positive case 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("positive case 2", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T16:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T20:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("positive case 3", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T14:00:00");
    const start2 = new Date("2025-09-21T23:00:00");
    const end2 = new Date("2025-09-22T12:00:01");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("negative case 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T11:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(false);
  });

  it("negative case 2", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T10:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(false);
  });
});

