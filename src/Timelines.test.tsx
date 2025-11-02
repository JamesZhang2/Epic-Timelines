import { describe, expect, it } from "vitest";
import { generateTimeBuckets, bucketEvents, computeEpicBucketHours } from "./Timelines";
import type { BucketedEvents, Epic, TimeBucket } from "./Timelines";
import { parseICSToCalendarEvents, type CalendarEvent } from "./Util";
import { readFileSync } from "fs";
import { join } from "path";

describe("generateTimeBuckets", () => {
  it("many buckets", () => {
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
    ]

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-24T00:00:00"))).toEqual(expected);
  });

  it("one bucket", () => {
    const expected = [{
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-23T00:00:00")
    }]

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-22T00:00:00"))).toEqual(expected);
  });

  it("empty", () => {
    const expected: TimeBucket[] = [];

    expect(generateTimeBuckets(new Date("2025-09-23T00:00:00"), new Date("2025-09-22T00:00:00"))).toEqual(expected);
  });
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

describe("computeEpicBucketHours", () => {
  const epic1: Epic = {
    name: "Alpha",
    keyword: "alpha",
    caseSensitive: false,
    color: "#000000"
  };
  const epic2: Epic = {
    name: "Beta",
    keyword: "beta",
    caseSensitive: false,
    color: "#000000"
  };
  const epic3: Epic = {
    name: "Gamma",
    keyword: "gamma",
    caseSensitive: false,
    color: "#000000"
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
      color: "#000000"
    };
    const epicB: Epic = {
      name: "Beta",
      keyword: "beta",
      caseSensitive: false,
      color: "#000000"
    };
    const epicC: Epic = {
      name: "Gamma",
      keyword: "gamma",
      caseSensitive: false,
      color: "#000000"
    };
    const epicD: Epic = {
      name: "Delta",
      keyword: "Delta",
      caseSensitive: true,
      color: "#000000"
    }
    const epics: Epic[] = [epicA, epicB, epicC, epicD];

    const filePath = join(__dirname, "../test/gcal/different-hours-1.ics");
    const text = readFileSync(filePath, "utf-8");
    const events: CalendarEvent[] = parseICSToCalendarEvents(text);
    const bucketedEventsList: BucketedEvents[] = bucketEvents(events, buckets);
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
