import { describe, expect, it } from "vitest";
import { generateTimeBuckets, hasNontrivialOverlap } from "./Timelines";
import type { TimeBucket } from "./Timelines";

describe("generateTimeBuckets", () => {
  it("generate time buckets", () => {
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

  it("generate time buckets - one bucket", () => {
    const expected = [{
      start: new Date("2025-09-22T00:00:00"),
      end: new Date("2025-09-23T00:00:00")
    }]

    expect(generateTimeBuckets(new Date("2025-09-22T00:00:00"), new Date("2025-09-22T00:00:00"))).toEqual(expected);
  });

  it("generate time buckets - empty", () => {
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
