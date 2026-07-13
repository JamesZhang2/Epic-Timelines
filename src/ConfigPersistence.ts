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
      startDate: dateAtLocalMidnight(saveFile.timelineOptions.startDate),
      endDate: dateAtLocalMidnight(saveFile.timelineOptions.endDate),
    },
  };
}
