import { describe, expect, it } from 'vitest';
import { generateTimeBuckets } from "./Timelines";
import type { TimeBucket } from "./Timelines";

describe("generatetimeBuckets", () => {
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
