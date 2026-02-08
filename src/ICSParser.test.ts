import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "./ICSParser";
import { parseICSToCalendarEvents } from "./ICSParser";
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
  });
});
