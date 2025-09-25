import { describe, expect, it } from "vitest";
import { generateTimeBuckets, bucketEvents, hasNontrivialOverlap } from "./Timelines";
import type { BucketedEvents, TimeBucket } from "./Timelines";
import type { CalendarEvent } from "./Util";

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
