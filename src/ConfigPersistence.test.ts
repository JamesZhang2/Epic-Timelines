import { describe, expect, it } from "vitest";
import type { Epic, TimelineOptions } from "./EpicTimelines";
import { deserializeConfig, serializeConfig } from "./ConfigPersistence";

describe("ConfigPersistence", () => {
  const epics: Epic[] = [
    {
      name: "Project Planning",
      keyword: "planning|roadmap",
      caseSensitive: false,
      color: "#7799ff",
      matchTitle: true,
      matchDescription: true,
      matchLocation: false,
    },
    {
      name: "Customer Calls",
      keyword: "customer",
      caseSensitive: true,
      color: "#ff6600",
      matchTitle: false,
      matchDescription: true,
      matchLocation: true,
    },
  ];

  const timelineOptions: TimelineOptions = {
    startDate: new Date(2026, 5, 24, 0, 0, 0, 0),
    endDate: new Date(2026, 6, 1, 0, 0, 0, 0),
    bucketGranularity: "week",
    showBucketHours: "all",
    ignoreAllDayEvents: false,
    useGlobalColor: true,
    useGlobalScale: true,
    globalColor: "#2f80ed",
  };

  it("serializes epics and options to the versioned save file shape", () => {
    const serialized = serializeConfig(epics, timelineOptions);

    expect(JSON.parse(serialized)).toEqual({
      version: 1,
      epics,
      timelineOptions: {
        startDate: "2026-06-24",
        endDate: "2026-07-01",
        bucketGranularity: "week",
        showBucketHours: "all",
        ignoreAllDayEvents: false,
        useGlobalColor: true,
        useGlobalScale: true,
        globalColor: "#2f80ed",
      },
    });
  });

  it("round trips epics and options", () => {
    const serialized = serializeConfig(epics, timelineOptions);

    expect(deserializeConfig(serialized)).toEqual({
      epics,
      timelineOptions,
    });
  });

  it("normalizes dates to local midnight when round tripping", () => {
    const nonMidnightOptions: TimelineOptions = {
      ...timelineOptions,
      startDate: new Date("2026-06-24T14:30:00"),
      endDate: new Date("2026-07-01T09:15:00"),
    };

    const serialized = serializeConfig(epics, nonMidnightOptions);

    expect(deserializeConfig(serialized).timelineOptions).toEqual({
      ...nonMidnightOptions,
      startDate: new Date(2026, 5, 24, 0, 0, 0, 0),
      endDate: new Date(2026, 6, 1, 0, 0, 0, 0),
    });
  });
});
