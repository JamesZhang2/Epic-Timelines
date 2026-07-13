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

  const validSaveFile = {
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
  };

  function cloneValidSaveFile() {
    return JSON.parse(JSON.stringify(validSaveFile));
  }

  it("serializes epics and options to the versioned save file shape", () => {
    const serialized = serializeConfig(epics, timelineOptions);

    expect(JSON.parse(serialized)).toEqual(validSaveFile);
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

  it("rejects invalid JSON", () => {
    expect(() => deserializeConfig("{")).toThrow("Config file must be valid JSON.");
  });

  it("rejects unsupported save file versions", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.version = 2;

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "Unsupported config file version: 2.",
    );
  });

  it("rejects configs that are not JSON objects", () => {
    expect(() => deserializeConfig("null")).toThrow("Config file must be a JSON object.");
    expect(() => deserializeConfig("[]")).toThrow("Config file must be a JSON object.");
  });

  it("rejects configs missing top-level keys", () => {
    const saveFile = cloneValidSaveFile();

    delete saveFile.epics;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include an "epics" array.',
    );

    saveFile.epics = epics;
    delete saveFile.timelineOptions;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include a "timelineOptions" object.',
    );
  });

  it("rejects configs with wrong top-level data types", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics = {};
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include an "epics" array.',
    );

    saveFile.epics = epics;
    saveFile.timelineOptions = [];
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include a "timelineOptions" object.',
    );
  });

  it("rejects invalid timeline option date strings", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.startDate = "06/24/2026";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "Config timelineOptions.startDate must be a valid yyyy-mm-dd date.",
    );

    saveFile.timelineOptions.startDate = "2026-06-24";
    saveFile.timelineOptions.endDate = "2026-02-30";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "Config timelineOptions.endDate must be a valid yyyy-mm-dd date.",
    );
  });

  it("rejects start dates that are after end dates", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.startDate = "2026-07-01";
    saveFile.timelineOptions.endDate = "2026-06-24";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "Config timelineOptions.startDate must be before timelineOptions.endDate.",
    );
  });
});
