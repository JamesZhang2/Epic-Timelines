import { describe, expect, it } from "vitest";
import { epicMatchesEvent, filterOutAllDayEvents } from "./EventUtil.ts";
import type { Epic } from "./EpicTimelines.tsx";
import type { CalendarEvent } from "./ICSParser.ts";

describe("filterOutAllDayEvents", () => {
  it("removes events whose duration is 24 hours or longer", () => {
    const shortEvent: CalendarEvent = {
      id: "short",
      title: "Short meeting",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00"),
    };
    const almostAllDayEvent: CalendarEvent = {
      id: "almost-all-day",
      title: "Almost all-day event",
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-22T23:59:59"),
    };
    const exactlyOneDayEvent: CalendarEvent = {
      id: "exactly-all-day",
      title: "Exactly all-day event",
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-23T00:00:00"),
    };
    const multiDayEvent: CalendarEvent = {
      id: "multi-day",
      title: "Multi-day event",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-23T08:00:01"),
    };

    expect(
      filterOutAllDayEvents([shortEvent, almostAllDayEvent, exactlyOneDayEvent, multiDayEvent]),
    ).toEqual([shortEvent, almostAllDayEvent]);
  });
});

describe("epicMatchesEvent", () => {
  const epicProto: Epic = {
    name: "Alpha",
    keyword: "Alpha",
    caseSensitive: false,
    color: "#000000",
    matchTitle: false,
    matchDescription: false,
    matchLocation: false,
  };

  it("supports regex", () => {
    const epic: Epic = {
      name: "foo",
      keyword: "^a*b+c?\\d",
      caseSensitive: false,
      color: "#000000",
      matchTitle: true,
      matchDescription: false,
      matchLocation: false,
    };
    const matchingEvents: CalendarEvent[] = [
      {
        id: "id1",
        title: "b1",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id2",
        title: "ab1",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id3",
        title: "aaaaaaaaab9",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id4",
        title: "bc7",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id5",
        title: "abc0",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id6",
        title: "aaabbbc123foo",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
    ];

    const nonMatchingEvents: CalendarEvent[] = [
      {
        id: "id1",
        title: "foo",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id2",
        title: "abc",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id3",
        title: "AC1",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id4",
        title: "dabc1",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id5",
        title: "ac3",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
      {
        id: "id6",
        title: "abcc4",
        start: new Date("2025-09-22T08:00:00"),
        end: new Date("2025-09-22T09:00:00"),
      },
    ];

    for (const event of matchingEvents) {
      expect(epicMatchesEvent(epic, event)).toEqual(true);
    }

    for (const event of nonMatchingEvents) {
      expect(epicMatchesEvent(epic, event)).toEqual(false);
    }
  });

  it("substring match", () => {
    const epic = structuredClone(epicProto);
    epic.matchTitle = true;
    const matchingEvent: CalendarEvent = {
      id: "id1",
      title: "foo Alpha bar",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00"),
    };
    const nonMatchingEvent: CalendarEvent = {
      id: "id2",
      title: "beta",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00"),
    };
    expect(epicMatchesEvent(epic, matchingEvent)).toEqual(true);
    expect(epicMatchesEvent(epic, nonMatchingEvent)).toEqual(false);
  });

  it("case sensitive", () => {
    const epic = structuredClone(epicProto);
    epic.caseSensitive = true;
    epic.matchTitle = true;
    const eventUpper: CalendarEvent = {
      id: "id1",
      title: "Alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00"),
    };
    const eventLower: CalendarEvent = {
      id: "id2",
      title: "alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00"),
    };
    expect(epicMatchesEvent(epic, eventUpper)).toEqual(true);
    expect(epicMatchesEvent(epic, eventLower)).toEqual(false);
  });

  const eventNoMatch: CalendarEvent = {
    id: "id1",
    title: "foo",
    description: "bar",
    location: "baz",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };
  const eventTitle: CalendarEvent = {
    id: "id1",
    title: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };
  const eventDesc: CalendarEvent = {
    id: "id2",
    title: "foo",
    description: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };
  const eventLoc: CalendarEvent = {
    id: "id3",
    title: "foo",
    location: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };
  const eventTitleDesc: CalendarEvent = {
    id: "id3",
    title: "Alpha",
    description: "Alpha",
    location: "foo",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };
  const eventDescLoc: CalendarEvent = {
    id: "id3",
    title: "foo",
    description: "Alpha",
    location: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00"),
  };

  it("title only", () => {
    const epic = structuredClone(epicProto);
    epic.matchTitle = true;
    expect(epicMatchesEvent(epic, eventNoMatch)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitle)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDesc)).toEqual(false);
    expect(epicMatchesEvent(epic, eventLoc)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitleDesc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDescLoc)).toEqual(false);
  });

  it("location only", () => {
    const epic = structuredClone(epicProto);
    epic.matchLocation = true;
    expect(epicMatchesEvent(epic, eventNoMatch)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitle)).toEqual(false);
    expect(epicMatchesEvent(epic, eventDesc)).toEqual(false);
    expect(epicMatchesEvent(epic, eventLoc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventTitleDesc)).toEqual(false);
    expect(epicMatchesEvent(epic, eventDescLoc)).toEqual(true);
  });

  it("title and description", () => {
    const epic = structuredClone(epicProto);
    epic.matchTitle = true;
    epic.matchDescription = true;
    expect(epicMatchesEvent(epic, eventNoMatch)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitle)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDesc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventLoc)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitleDesc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDescLoc)).toEqual(true);
  });

  it("title, description, and location", () => {
    const epic = structuredClone(epicProto);
    epic.matchTitle = true;
    epic.matchDescription = true;
    epic.matchLocation = true;
    expect(epicMatchesEvent(epic, eventNoMatch)).toEqual(false);
    expect(epicMatchesEvent(epic, eventTitle)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDesc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventLoc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventTitleDesc)).toEqual(true);
    expect(epicMatchesEvent(epic, eventDescLoc)).toEqual(true);
  });
});
