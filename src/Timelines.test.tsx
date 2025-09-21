import { expect, test } from 'vitest';
import { generateTimeBuckets } from "./Timelines";

test("Generate time buckets", () => {
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
})