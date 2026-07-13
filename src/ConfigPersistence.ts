/**
 * Saves/loads the config (Epics and TimelineOptions) to/from a JSON file.
 */

import type { Epic, TimelineOptions } from "./EpicTimelines";
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

  return {
    epics: saveFile.epics,
    timelineOptions: {
      ...saveFile.timelineOptions,
      startDate: parseConfigDate("startDate", saveFile.timelineOptions.startDate),
      endDate: parseConfigDate("endDate", saveFile.timelineOptions.endDate),
    },
  };
}
