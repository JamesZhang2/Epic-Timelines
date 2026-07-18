/**
 * Saves/loads the config (Epics and TimelineOptions) to/from a JSON file.
 */

import { BUCKET_GRANULARITIES, SHOW_BUCKET_HOURS } from "./Timelines.types";
import type { BucketGranularity, Epic, ShowBucketHours, TimelineOptions } from "./Timelines.types";
import { dateAtLocalMidnight } from "./Util";

const SAVE_FILE_VERSION = 1;

type SerializedTimelineOptions = Omit<TimelineOptions, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

type ConfigSaveFile = {
  version: typeof SAVE_FILE_VERSION;
  epics: Epic[];
  timelineOptions: SerializedTimelineOptions;
};

export type LoadedConfig = {
  epics: Epic[];
  timelineOptions: TimelineOptions;
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseConfigDate(fieldName: "startDate" | "endDate", value: unknown): Date {
  if (typeof value !== "string") {
    throw new Error(`Config timelineOptions.${fieldName} must be a valid yyyy-mm-dd date.`);
  }

  const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!result) {
    throw new Error(`Config timelineOptions.${fieldName} must be a valid yyyy-mm-dd date.`);
  }

  const year = Number(result[1]);
  const month = Number(result[2]);
  const day = Number(result[3]);
  const date = dateAtLocalMidnight(value);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Config timelineOptions.${fieldName} must be a valid yyyy-mm-dd date.`);
  }

  return date;
}

function isBucketGranularity(value: unknown): value is BucketGranularity {
  return BUCKET_GRANULARITIES.includes(value as BucketGranularity);
}

function parseBucketGranularity(value: unknown): BucketGranularity {
  if (!isBucketGranularity(value)) {
    throw new Error("Config timelineOptions.bucketGranularity must be a valid bucket granularity.");
  }
  return value as BucketGranularity;
}

function isShowBucketHours(value: unknown): value is ShowBucketHours {
  return SHOW_BUCKET_HOURS.includes(value as ShowBucketHours);
}

function parseShowBucketHours(value: unknown): ShowBucketHours {
  if (!isShowBucketHours(value)) {
    throw new Error("Config timelineOptions.showBucketHours must be all, nonzero, or none.");
  }
  return value as ShowBucketHours;
}

function isConfigBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function parseConfigBoolean(fieldName: string, value: unknown): boolean {
  if (!isConfigBoolean(value)) {
    throw new Error(`Config ${fieldName} must be a boolean.`);
  }
  return value as boolean;
}

function isConfigColor(value: unknown): value is string {
  return typeof value === "string" && /^#[a-f0-9]{6}$/i.test(value);
}

function parseConfigColor(fieldName: "globalColor", value: unknown): string {
  if (!isConfigColor(value)) {
    throw new Error(`Config timelineOptions.${fieldName} must be a color in the format #RRGGBB.`);
  }
  return value;
}

function isEpicName(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function parseEpicName(epicIndex: number, value: unknown): string {
  if (!isEpicName(value)) {
    throw new Error(`Config epics[${epicIndex}].name must be a non-empty string.`);
  }
  return value;
}

function isEpicKeyword(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function parseEpicKeyword(epicIndex: number, value: unknown): string {
  if (!isEpicKeyword(value)) {
    throw new Error(`Config epics[${epicIndex}].keyword must be a non-empty string.`);
  }
  return value;
}

function parseEpic(epicIndex: number, value: unknown): Epic {
  if (!isJsonObject(value)) {
    throw new Error(`Config epics[${epicIndex}] must be an object.`);
  }

  return {
    ...value,
    name: parseEpicName(epicIndex, value.name),
    keyword: parseEpicKeyword(epicIndex, value.keyword),
    caseSensitive: parseConfigBoolean(`epics[${epicIndex}].caseSensitive`, value.caseSensitive),
  } as Epic;
}

function parseEpics(value: unknown[]): Epic[] {
  return value.map((epic, index) => parseEpic(index, epic));
}

export function serializeConfig(epics: Epic[], timelineOptions: TimelineOptions): string {
  const saveFile: ConfigSaveFile = {
    version: SAVE_FILE_VERSION,
    epics,
    timelineOptions: {
      ...timelineOptions,
      startDate: formatLocalDate(timelineOptions.startDate),
      endDate: formatLocalDate(timelineOptions.endDate),
    },
  };

  return JSON.stringify(saveFile, null, 2);
}

export function deserializeConfig(jsonText: string): LoadedConfig {
  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(jsonText);
  } catch {
    throw new Error("Config file must be valid JSON.");
  }

  if (!isJsonObject(parsedConfig)) {
    throw new Error("Config file must be a JSON object.");
  }

  if (parsedConfig.version !== SAVE_FILE_VERSION) {
    throw new Error(`Unsupported config file version: ${parsedConfig.version}.`);
  }

  if (!Array.isArray(parsedConfig.epics)) {
    throw new Error('Config file must include an "epics" array.');
  }

  if (!isJsonObject(parsedConfig.timelineOptions)) {
    throw new Error('Config file must include a "timelineOptions" object.');
  }

  const saveFile = parsedConfig as ConfigSaveFile;
  const epics = parseEpics(parsedConfig.epics);
  const startDate = parseConfigDate("startDate", saveFile.timelineOptions.startDate);
  const endDate = parseConfigDate("endDate", saveFile.timelineOptions.endDate);

  if (startDate > endDate) {
    throw new Error("Config timelineOptions.startDate must be before timelineOptions.endDate.");
  }

  const bucketGranularity = parseBucketGranularity(saveFile.timelineOptions.bucketGranularity);
  const showBucketHours = parseShowBucketHours(saveFile.timelineOptions.showBucketHours);
  const ignoreAllDayEvents = parseConfigBoolean(
    "timelineOptions.ignoreAllDayEvents",
    saveFile.timelineOptions.ignoreAllDayEvents,
  );
  const useGlobalColor = parseConfigBoolean(
    "timelineOptions.useGlobalColor",
    saveFile.timelineOptions.useGlobalColor,
  );
  const useGlobalScale = parseConfigBoolean(
    "timelineOptions.useGlobalScale",
    saveFile.timelineOptions.useGlobalScale,
  );
  const globalColor = parseConfigColor("globalColor", saveFile.timelineOptions.globalColor);

  return {
    epics,
    timelineOptions: {
      startDate,
      endDate,
      bucketGranularity,
      showBucketHours,
      ignoreAllDayEvents,
      useGlobalColor,
      useGlobalScale,
      globalColor,
    },
  };
}
