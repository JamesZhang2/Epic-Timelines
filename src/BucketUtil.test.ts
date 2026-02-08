import { describe, expect, it } from "vitest";
import { generateTimeBuckets, bucketEvents, computeEpicBucketHours, lastDayOfMonth, epicMatchesEvent } from "./BucketUtil.ts";
import type { BucketedEvents, Epic, TimeBucket } from "./EpicTimelines.tsx";
import { parseICSToCalendarEvents } from "./ICSParser.ts";
import type { CalendarEvent } from "./ICSParser.ts";
import { readFileSync } from "fs";
import { join } from "path";

describe("generateTimeBuckets", () => {
  it("1 day, many buckets", () => {
    const expected = [{
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-23T00:00:00")
    },
    {
      start: new Date("2025-09-23T00:00:00"),
      end: new Date("2025-09-24T00:00:00")
    },
    {
      start: new Date("2025-09-24T00:00:00"),
      end: new Date("2025-09-25T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-24T00:00:00"), 0, 0, 1)).toEqual(expected);
  });

  it("1 day, month boundary", () => {
    const expected = [{
      start: new Date("2025-09-29T00:00:00"),
      end: new Date("2025-09-30T00:00:00")
    },
    {
      start: new Date("2025-09-30T00:00:00"),
      end: new Date("2025-10-01T00:00:00")
    },
    {
      start: new Date("2025-10-01T00:00:00"),
      end: new Date("2025-10-02T00:00:00")
    },
    {
      start: new Date("2025-10-02T00:00:00"),
      end: new Date("2025-10-03T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-09-29T00:00:00"), new Date("2025-10-02T00:00:00"), 0, 0, 1)).toEqual(expected);
  });

  it("1 day, one bucket", () => {
    const expected = [{
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-23T00:00:00")
    }];

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 0, 1)).toEqual(expected);
  });

  it("7 days, many buckets", () => {
    const expected = [{
      start: new Date("2025-12-01T00:00:00"),
      end: new Date("2025-12-08T00:00:00")
    },
    {
      start: new Date("2025-12-08T00:00:00"),
      end: new Date("2025-12-15T00:00:00")
    },
    {
      start: new Date("2025-12-15T00:00:00"),
      end: new Date("2025-12-22T00:00:00")
    },
    {
      start: new Date("2025-12-22T00:00:00"),
      end: new Date("2025-12-29T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-12-01T00:00:00"), new Date("2025-12-22T00:00:00"), 0, 0, 7)).toEqual(expected);
    expect(generateTimeBuckets(new Date("2025-12-01T00:00:00"), new Date("2025-12-28T00:00:00"), 0, 0, 7)).toEqual(expected);
  });

  it("7 days, one bucket", () => {
    const expected = [{
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-29T00:00:00")
    }];

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 0, 7)).toEqual(expected);
    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-23T00:00:00"), 0, 0, 7)).toEqual(expected);
    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-28T00:00:00"), 0, 0, 7)).toEqual(expected);
  });

  it("1 month, many buckets", () => {
    const expected = [{
      start: new Date("2025-11-07T00:00:00"),
      end: new Date("2025-12-07T00:00:00")
    },
    {
      start: new Date("2025-12-07T00:00:00"),
      end: new Date("2026-01-07T00:00:00")
    },
    {
      start: new Date("2026-01-07T00:00:00"),
      end: new Date("2026-02-07T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-11-07T00:00:00"), new Date("2026-02-01T00:00:00"), 0, 1, 0)).toEqual(expected);
  });

  it("1 month, edge cases", () => {
    const expected1 = [{
      start: new Date("2025-07-31T00:00:00"),
      end: new Date("2025-08-31T00:00:00")
    },
    {
      start: new Date("2025-08-31T00:00:00"),
      end: new Date("2025-09-30T00:00:00")  // Sept 31 does not exist
    },
    {
      start: new Date("2025-09-30T00:00:00"),
      end: new Date("2025-10-31T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-07-31T00:00:00"), new Date("2025-10-01T00:00:00"), 0, 1, 0)).toEqual(expected1);

    const expected2 = [{
      start: new Date("2024-01-30T00:00:00"),
      end: new Date("2024-02-29T00:00:00")  // Feb 30 doesn't exist but Feb 29 does in 2024
    },
    {
      start: new Date("2024-02-29T00:00:00"),
      end: new Date("2024-03-30T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2024-01-30T00:00:00"), new Date("2024-03-29T00:00:00"), 0, 1, 0)).toEqual(expected2);
  });

  it("2 months, edge cases", () => {
    const expected1 = [{
      start: new Date("2025-07-31T00:00:00"),
      end: new Date("2025-09-30T00:00:00")  // Sept 31 does not exist
    },
    {
      start: new Date("2025-09-30T00:00:00"),
      end: new Date("2025-11-30T00:00:00")  // Nov 31 doesn't exist either
    },
    {
      start: new Date("2025-11-30T00:00:00"),
      end: new Date("2026-01-31T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-07-31T00:00:00"), new Date("2026-01-01T00:00:00"), 0, 2, 0)).toEqual(expected1);

    const expected2 = [{
      start: new Date("2023-12-31T00:00:00"),
      end: new Date("2024-02-29T00:00:00")  // Feb 31 or 30 don't exist but Feb 29 does in 2024
    },
    {
      start: new Date("2024-02-29T00:00:00"),
      end: new Date("2024-04-30T00:00:00")  // Apr 31 doesn't exist
    },
    ];

    expect(generateTimeBuckets(new Date("2023-12-31T00:00:00"), new Date("2024-02-29T00:00:00"), 0, 2, 0)).toEqual(expected2);
  });

  it("3 months, one bucket", () => {
    const expected = [{
      start: new Date("2025-11-07T00:00:00"),
      end: new Date("2026-02-07T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2025-11-07T00:00:00"), new Date("2026-01-01T00:00:00"), 0, 3, 0)).toEqual(expected);
  });

  it("1 year, many buckets", () => {
    const expected = [{
      start: new Date("2023-03-08T00:00:00"),
      end: new Date("2024-03-08T00:00:00")
    },
    {
      start: new Date("2024-03-08T00:00:00"),
      end: new Date("2025-03-08T00:00:00")
    },
    ];

    expect(generateTimeBuckets(new Date("2023-03-08T00:00:00"), new Date("2025-03-07T00:00:00"), 1, 0, 0)).toEqual(expected);
  });

  it("1 year, edge case", () => {
    const expected = [{
      start: new Date("2024-02-29T00:00:00"),  // 2024 is a leap year
      end: new Date("2025-02-28T00:00:00")
    },
    {
      start: new Date("2025-02-28T00:00:00"),
      end: new Date("2026-02-28T00:00:00")
    },
    {
      start: new Date("2026-02-28T00:00:00"),
      end: new Date("2027-02-28T00:00:00")
    },
    {
      start: new Date("2027-02-28T00:00:00"),
      end: new Date("2028-02-29T00:00:00")  // 2028 is a leap year
    },
    ];

    expect(generateTimeBuckets(new Date("2024-02-29T00:00:00"), new Date("2028-02-28T00:00:00"), 1, 0, 0)).toEqual(expected);
  });


  it("bad cases", () => {
    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), -1, 0, 0)).toThrowError("All deltas must be nonnegative.");

    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 0, -1)).toThrowError("All deltas must be nonnegative.");

    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 0, 0)).toThrowError("Exactly one of yearDelta, monthDelta, and dayDelta must be nonzero.");

    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 1, 1)).toThrowError("Exactly one of yearDelta, monthDelta, and dayDelta must be nonzero.");

    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), 3, 0, 7)).toThrowError("Exactly one of yearDelta, monthDelta, and dayDelta must be nonzero.");

    expect(() => generateTimeBuckets(new Date("2025-09-20T00:00:00"), new Date("2025-09-22T00:00:00"), 1, 2, 3)).toThrowError("Exactly one of yearDelta, monthDelta, and dayDelta must be nonzero.");

    expect(() => generateTimeBuckets(new Date("2025-09-23T00:00:00"), new Date("2025-09-22T00:00:00"), 0, 0, 1)).toThrowError("endDate must be later than or equal to startDate.");
  })
});

describe("getBucketedEvents", () => {
  const bucket1: TimeBucket = {
    start: new Date("2025-09-22T00:00:00"),
    end: new Date("2025-09-23T00:00:00")
  };
  const bucket2: TimeBucket = {
    start: new Date("2025-09-23T00:00:00"),
    end: new Date("2025-09-24T00:00:00")
  };
  const bucket3: TimeBucket = {
    start: new Date("2025-09-24T00:00:00"),
    end: new Date("2025-09-25T00:00:00")
  };
  const bucket4: TimeBucket = {
    start: new Date("2025-09-25T00:00:00"),
    end: new Date("2025-09-26T00:00:00")
  };
  const buckets: TimeBucket[] = [bucket1, bucket2, bucket3, bucket4];

  it("regular case", () => {
    const event1: CalendarEvent =
    {
      id: "id1",
      title: "A",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    const event2: CalendarEvent = {
      id: "id2",
      title: "B",
      start: new Date("2025-09-23T08:00:00"),
      end: new Date("2025-09-23T10:00:00")
    };
    const event3: CalendarEvent =
    {
      id: "id3",
      title: "C",
      start: new Date("2025-09-23T15:00:00"),
      end: new Date("2025-09-23T17:00:00")
    };
    const event4: CalendarEvent = {
      id: "id4",
      title: "D",
      start: new Date("2025-09-25T08:00:00"),
      end: new Date("2025-09-25T20:00:00")
    };
    const event5: CalendarEvent = {
      id: "id5",
      title: "E",
      start: new Date("2025-09-26T06:00:00"),
      end: new Date("2025-09-26T07:30:00"),
    }
    const events: CalendarEvent[] = [event1, event2, event3, event4, event5];

    const expected: BucketedEvents[] = [
      {
        bucket: bucket1,
        events: [event1]
      },
      {
        bucket: bucket2,
        events: [event2, event3]
      },
      {
        bucket: bucket3,
        events: []
      },
      {
        bucket: bucket4,
        events: [event4]
      }
    ];

    expect(bucketEvents(events, buckets)).toEqual(expected);
  });

  it("multi-day events", () => {
    const event1: CalendarEvent =
    {
      id: "id1",
      title: "A",
      start: new Date("2025-09-21T22:30:00"),
      end: new Date("2025-09-22T01:00:00")
    };
    const event2: CalendarEvent = {
      id: "id2",
      title: "B",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-23T10:00:00")
    };
    const event3: CalendarEvent =
    {
      id: "id3",
      title: "C",
      start: new Date("2025-09-24T00:00:00"),
      end: new Date("2025-09-25T00:00:00")
    };
    const event4: CalendarEvent = {
      id: "id4",
      title: "D",
      start: new Date("2025-09-25T08:00:00"),
      end: new Date("2025-09-26T08:00:00")
    };
    const events: CalendarEvent[] = [event1, event2, event3, event4];

    const expected: BucketedEvents[] = [
      {
        bucket: bucket1,
        events: [event1, event2]
      },
      {
        bucket: bucket2,
        events: [event2]
      },
      {
        bucket: bucket3,
        events: [event3]
      },
      {
        bucket: bucket4,
        events: [event4]
      }
    ];

    expect(bucketEvents(events, buckets)).toEqual(expected);
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
    matchLocation: false
  };

  it("supports regex", () => {
    const epic: Epic = {
      name: "foo",
      keyword: "^a*b+c?\\d",
      caseSensitive: false,
      color: "#000000",
      matchTitle: true,
      matchDescription: false,
      matchLocation: false
    };
    const matchingEvents: CalendarEvent[] = [{
      id: "id1",
      title: "b1",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id2",
      title: "ab1",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id3",
      title: "aaaaaaaaab9",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id4",
      title: "bc7",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id5",
      title: "abc0",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id6",
      title: "aaabbbc123foo",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    }];

    const nonMatchingEvents: CalendarEvent[] = [{
      id: "id1",
      title: "foo",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id2",
      title: "abc",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id3",
      title: "AC1",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id4",
      title: "dabc1",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id5",
      title: "ac3",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    },
    {
      id: "id6",
      title: "abcc4",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    }];

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
    const matchingEvent: CalendarEvent =
    {
      id: "id1",
      title: "foo Alpha bar",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    const nonMatchingEvent: CalendarEvent =
    {
      id: "id2",
      title: "beta",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    expect(epicMatchesEvent(epic, matchingEvent)).toEqual(true);
    expect(epicMatchesEvent(epic, nonMatchingEvent)).toEqual(false);
  });

  it("case sensitive", () => {
    const epic = structuredClone(epicProto);
    epic.caseSensitive = true;
    epic.matchTitle = true;
    const eventUpper: CalendarEvent =
    {
      id: "id1",
      title: "Alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    const eventLower: CalendarEvent =
    {
      id: "id2",
      title: "alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    expect(epicMatchesEvent(epic, eventUpper)).toEqual(true);
    expect(epicMatchesEvent(epic, eventLower)).toEqual(false);
  });

  const eventNoMatch: CalendarEvent =
  {
    id: "id1",
    title: "foo",
    description: "bar",
    location: "baz",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
  };
  const eventTitle: CalendarEvent =
  {
    id: "id1",
    title: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
  };
  const eventDesc: CalendarEvent =
  {
    id: "id2",
    title: "foo",
    description: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
  };
  const eventLoc: CalendarEvent =
  {
    id: "id3",
    title: "foo",
    location: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
  };
  const eventTitleDesc: CalendarEvent =
  {
    id: "id3",
    title: "Alpha",
    description: "Alpha",
    location: "foo",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
  };
  const eventDescLoc: CalendarEvent =
  {
    id: "id3",
    title: "foo",
    description: "Alpha",
    location: "Alpha",
    start: new Date("2025-09-22T08:00:00"),
    end: new Date("2025-09-22T09:00:00")
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

describe("computeEpicBucketHours", () => {
  const epic1: Epic = {
    name: "Alpha",
    keyword: "alpha",
    caseSensitive: false,
    color: "#000000",
    matchTitle: true,
    matchDescription: false,
    matchLocation: false
  };
  const epic2: Epic = {
    name: "Beta",
    keyword: "beta",
    caseSensitive: false,
    color: "#000000",
    matchTitle: true,
    matchDescription: false,
    matchLocation: false
  };
  const epic3: Epic = {
    name: "Gamma",
    keyword: "gamma",
    caseSensitive: false,
    color: "#000000",
    matchTitle: true,
    matchDescription: false,
    matchLocation: false
  };
  const epics: Epic[] = [epic1, epic2, epic3];

  const bucket1: TimeBucket = {
    start: new Date("2025-09-22T00:00:00"),
    end: new Date("2025-09-23T00:00:00")
  };
  const bucket2: TimeBucket = {
    start: new Date("2025-09-23T00:00:00"),
    end: new Date("2025-09-24T00:00:00")
  };
  const bucket3: TimeBucket = {
    start: new Date("2025-09-24T00:00:00"),
    end: new Date("2025-09-25T00:00:00")
  };
  const bucket4: TimeBucket = {
    start: new Date("2025-09-25T00:00:00"),
    end: new Date("2025-09-26T00:00:00")
  };
  const buckets: TimeBucket[] = [bucket1, bucket2, bucket3, bucket4];

  it("regular case", () => {
    const event1: CalendarEvent =
    {
      id: "id1",
      title: "Alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    const event2: CalendarEvent = {
      id: "id2",
      title: "Beta",
      start: new Date("2025-09-23T08:00:00"),
      end: new Date("2025-09-23T10:00:00")
    };
    const event3: CalendarEvent =
    {
      id: "id3",
      title: "Gamma",
      start: new Date("2025-09-23T15:00:00"),
      end: new Date("2025-09-23T17:00:00")
    };
    const event4: CalendarEvent = {
      id: "id4",
      title: "Alpha",
      start: new Date("2025-09-25T08:00:00"),
      end: new Date("2025-09-25T20:00:00")
    };
    const event5: CalendarEvent = {
      id: "id5",
      title: "Beta",
      start: new Date("2025-09-24T14:00:00"),
      end: new Date("2025-09-24T14:15:00")
    };
    const events: CalendarEvent[] = [event1, event2, event3, event4, event5];

    const bucketedEventsList: BucketedEvents[] = bucketEvents(events, buckets);
    const epicBucketHours: Map<string, number[]> = computeEpicBucketHours(epics, bucketedEventsList);

    const expected: Map<string, number[]> = new Map([
      ["Alpha", [1, 0, 0, 12]],
      ["Beta", [0, 2, 0.25, 0]],
      ["Gamma", [0, 2, 0, 0]]
    ]);
    expect(epicBucketHours).toEqual(expected);
  });

  it("multiple events of the same title in a day", () => {
    const event1: CalendarEvent =
    {
      id: "id1",
      title: "Alpha",
      start: new Date("2025-09-22T08:00:00"),
      end: new Date("2025-09-22T09:00:00")
    };
    const event2: CalendarEvent = {
      id: "id2",
      title: "Alpha",
      start: new Date("2025-09-22T10:00:00"),
      end: new Date("2025-09-22T11:30:00")
    };
    const event3: CalendarEvent =
    {
      id: "id3",
      title: "Alpha",
      start: new Date("2025-09-22T14:00:00"),
      end: new Date("2025-09-22T17:00:00")
    };
    const event4: CalendarEvent = {
      id: "id4",
      title: "Beta",
      start: new Date("2025-09-25T00:00:00"),
      end: new Date("2025-09-25T20:00:00")
    };
    const event5: CalendarEvent = {
      id: "id5",
      title: "Beta",
      start: new Date("2025-09-25T20:30:00"),
      end: new Date("2025-09-25T21:00:00")
    };
    const events: CalendarEvent[] = [event1, event2, event3, event4, event5];

    const bucketedEventsList: BucketedEvents[] = bucketEvents(events, buckets);
    const epicBucketHours: Map<string, number[]> = computeEpicBucketHours(epics, bucketedEventsList);

    const expected: Map<string, number[]> = new Map([
      ["Alpha", [5.5, 0, 0, 0]],
      ["Beta", [0, 0, 0, 20.5]],
      ["Gamma", [0, 0, 0, 0]]
    ]);
    expect(epicBucketHours).toEqual(expected);
  });

  it("multi-day events", () => {
    const event1: CalendarEvent =
    {
      id: "id1",
      title: "Alpha",
      start: new Date("2025-09-22T22:00:00"),
      end: new Date("2025-09-23T01:00:00")
    };
    const event2: CalendarEvent = {
      id: "id2",
      title: "Alpha",
      start: new Date("2025-09-23T18:00:00"),
      end: new Date("2025-09-25T12:00:00")
    };
    const event3: CalendarEvent =
    {
      id: "id3",
      title: "Beta",
      start: new Date("2025-09-21T00:00:00"),
      end: new Date("2025-09-23T00:00:00")
    };
    const event4: CalendarEvent =
    {
      id: "id4",
      title: "Gamma",
      start: new Date("2025-09-25T16:00:00"),
      end: new Date("2025-09-28T16:00:00")
    };
    const events: CalendarEvent[] = [event1, event2, event3, event4];

    const bucketedEventsList: BucketedEvents[] = bucketEvents(events, buckets);
    const epicBucketHours: Map<string, number[]> = computeEpicBucketHours(epics, bucketedEventsList);

    const expected: Map<string, number[]> = new Map([
      ["Alpha", [2, 7, 24, 12]],
      ["Beta", [24, 0, 0, 0]],
      ["Gamma", [0, 0, 0, 8]]
    ]);
    expect(epicBucketHours).toEqual(expected);
  });

  it("different-hours-1 integration test", () => {
    const epicA: Epic = {
      name: "Alpha",
      keyword: "alpha",
      caseSensitive: false,
      color: "#000000",
      matchTitle: true,
      matchDescription: true,
      matchLocation: false
    };
    const epicB: Epic = {
      name: "Beta",
      keyword: "beta",
      caseSensitive: false,
      color: "#000000",
      matchTitle: true,
      matchDescription: true,
      matchLocation: false
    };
    const epicC: Epic = {
      name: "Gamma",
      keyword: "gamma",
      caseSensitive: false,
      color: "#000000",
      matchTitle: true,
      matchDescription: true,
      matchLocation: false
    };
    const epicD: Epic = {
      name: "Delta",
      keyword: "Delta",
      caseSensitive: true,
      color: "#000000",
      matchTitle: true,
      matchDescription: true,
      matchLocation: false
    }
    const epics: Epic[] = [epicA, epicB, epicC, epicD];

    const bucket1PST: TimeBucket = {
      start: new Date("2025-09-22T00:00:00-08:00"),
      end: new Date("2025-09-23T00:00:00-08:00")
    };
    const bucket2PST: TimeBucket = {
      start: new Date("2025-09-23T00:00:00-08:00"),
      end: new Date("2025-09-24T00:00:00-08:00")
    };
    const bucket3PST: TimeBucket = {
      start: new Date("2025-09-24T00:00:00-08:00"),
      end: new Date("2025-09-25T00:00:00-08:00")
    };
    const bucket4PST: TimeBucket = {
      start: new Date("2025-09-25T00:00:00-08:00"),
      end: new Date("2025-09-26T00:00:00-08:00")
    };
    const bucketsPST: TimeBucket[] = [bucket1PST, bucket2PST, bucket3PST, bucket4PST];

    const filePath = join(__dirname, "../test/gcal/different-hours-1.ics");
    const text = readFileSync(filePath, "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEvents(text);
    const bucketedEventsList: BucketedEvents[] = bucketEvents(events, bucketsPST);
    const epicBucketHours: Map<string, number[]> = computeEpicBucketHours(epics, bucketedEventsList);

    const expected: Map<string, number[]> = new Map([
      ["Alpha", [1, 1.5, 2, 2.5]],
      ["Beta", [3, 2.5, 2, 1.5]],
      ["Gamma", [1, 2, 1, 4]],
      ["Delta", [1, 0, 3.5, 3]]
    ]);
    expect(epicBucketHours).toEqual(expected);
  });
});

describe("lastDayOfMonth", () => {
  it("non-leap year", () => {
    const expected: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let i = 0; i < 12; i++) {
      expect(lastDayOfMonth(2025, i)).toEqual(expected[i]);
      expect(lastDayOfMonth(1900, i)).toEqual(expected[i]);
    }
  })

  it("leap year", () => {
    const expected: number[] = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let i = 0; i < 12; i++) {
      expect(lastDayOfMonth(2024, i)).toEqual(expected[i]);
      expect(lastDayOfMonth(2020, i)).toEqual(expected[i]);
      expect(lastDayOfMonth(2000, i)).toEqual(expected[i]);
    }
  })
})