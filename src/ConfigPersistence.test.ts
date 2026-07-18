import { describe, expect, it } from "vitest";
import type { Epic, TimelineOptions } from "./Timelines.types";
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

  // Top-level error cases

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

  it("rejects null configs", () => {
    expect(() => deserializeConfig("null")).toThrow("Config file must be a JSON object.");
  });

  it("rejects array configs", () => {
    expect(() => deserializeConfig("[]")).toThrow("Config file must be a JSON object.");
  });

  // Epics error cases

  it("rejects configs missing epics", () => {
    const saveFile = cloneValidSaveFile();

    delete saveFile.epics;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include an "epics" array.',
    );
  });

  it("rejects configs where epics is not an array", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics = {};
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include an "epics" array.',
    );
  });

  it("rejects epics that are not objects", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.epics = ["foo", "bar"];
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0] must be an object.",
    );
  });

  it("rejects epics with non-string names", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].name = 123;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].name must be a non-empty string.",
    );
  });

  it("rejects epics with blank names", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].name = "   ";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].name must be a non-empty string.",
    );
  });

  it("rejects epics with non-string keywords", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].keyword = 123;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].keyword must be a non-empty string and a valid regex.",
    );
  });

  it("rejects epics with blank keywords", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].keyword = "   ";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].keyword must be a non-empty string and a valid regex.",
    );
  });

  it("rejects epics with malformed keyword regexes", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.epics[0].keyword = "[a-z"; // Invalid regex.
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].keyword must be a non-empty string and a valid regex.",
    );
  });

  it("rejects epics with non-boolean caseSensitive values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].caseSensitive = "true";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].caseSensitive must be a boolean.",
    );
  });

  it("rejects epics with numeric color values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].color = 123;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].color must be a color in the format #RRGGBB.",
    );
  });

  it("rejects epics with short color values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].color = "#123";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].color must be a color in the format #RRGGBB.",
    );
  });

  it("rejects epics with color values without a leading hash", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].color = "2f80ed";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].color must be a color in the format #RRGGBB.",
    );
  });

  it("rejects epics with invalid color values", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.epics[0].color = "#colors";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].color must be a color in the format #RRGGBB.",
    );
  });

  it("rejects epics with non-boolean matchTitle values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].matchTitle = "true";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].matchTitle must be a boolean.",
    );
  });

  it("rejects epics with non-boolean matchDescription values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].matchDescription = "false";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].matchDescription must be a boolean.",
    );
  });

  it("rejects epics with non-boolean matchLocation values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.epics[0].matchLocation = "foo";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0].matchLocation must be a boolean.",
    );
  });

  it("rejects epics with duplicate names", () => {
    const invalidSaveFile = {
      version: 1,
      epics: [
        {
          name: "Alpha",
          keyword: "alpha1",
          caseSensitive: true,
          color: "#7799ff",
          matchTitle: true,
          matchDescription: true,
          matchLocation: false,
        },
        {
          name: "Alpha",
          keyword: "alpha2",
          caseSensitive: false,
          color: "#885533",
          matchTitle: false,
          matchDescription: true,
          matchLocation: false,
        },
      ],
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

    expect(() => deserializeConfig(JSON.stringify(invalidSaveFile))).toThrow(
      "Epics must have unique names.",
    );
  });

  it("rejects epics where matchTitle, matchDescription, and matchLocation are all false", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.epics[0].matchTitle = false;
    saveFile.epics[0].matchDescription = false;
    saveFile.epics[0].matchLocation = false;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "epics[0] must have at least one of the fields included in the match.",
    );
  });

  // Timeline options error cases

  it("rejects configs missing timeline options", () => {
    const saveFile = cloneValidSaveFile();

    delete saveFile.timelineOptions;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include a "timelineOptions" object.',
    );
  });

  it("rejects configs where timeline options is an array", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions = [];
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      'Config file must include a "timelineOptions" object.',
    );
  });

  it("rejects timeline options missing required fields", () => {
    const saveFile = cloneValidSaveFile();
    delete saveFile.timelineOptions.startDate;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.startDate must be a valid yyyy-mm-dd date.",
    );
  });

  it("rejects start dates that are not strings", () => {
    const saveFile = cloneValidSaveFile();
    saveFile.timelineOptions.startDate = 12345;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.startDate must be a valid yyyy-mm-dd date.",
    );
  });

  it("rejects invalid start date strings", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.startDate = "06/24/2026";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.startDate must be a valid yyyy-mm-dd date.",
    );
  });

  it("rejects invalid end date strings", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.endDate = "2026-02-30";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.endDate must be a valid yyyy-mm-dd date.",
    );
  });

  it("rejects start dates that are after end dates", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.startDate = "2026-07-01";
    saveFile.timelineOptions.endDate = "2026-06-24";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.startDate must be before timelineOptions.endDate.",
    );
  });

  it("rejects invalid BucketGranularity values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.bucketGranularity = "quarter";

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.bucketGranularity must be a valid bucket granularity.",
    );
  });

  it("rejects invalid ShowBucketHours values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.showBucketHours = "true";

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.showBucketHours must be all, nonzero, or none.",
    );
  });

  it("rejects non-boolean ignoreAllDayEvents values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.ignoreAllDayEvents = "true";

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.ignoreAllDayEvents must be a boolean.",
    );
  });

  it("rejects non-boolean useGlobalColor values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.useGlobalColor = "false";

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.useGlobalColor must be a boolean.",
    );
  });

  it("rejects non-boolean useGlobalScale values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.useGlobalScale = "true";

    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.useGlobalScale must be a boolean.",
    );
  });

  it("rejects numeric global color values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.globalColor = 123;
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.globalColor must be a color in the format #RRGGBB.",
    );
  });

  it("rejects short global color values", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.globalColor = "#123";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.globalColor must be a color in the format #RRGGBB.",
    );
  });

  it("rejects global color values without a leading hash", () => {
    const saveFile = cloneValidSaveFile();

    saveFile.timelineOptions.globalColor = "2f80ed";
    expect(() => deserializeConfig(JSON.stringify(saveFile))).toThrow(
      "timelineOptions.globalColor must be a color in the format #RRGGBB.",
    );
  });
});
