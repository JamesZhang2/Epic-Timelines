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
  const saveFile = JSON.parse(jsonText) as ConfigSaveFile;

  return {
    epics: saveFile.epics,
    timelineOptions: {
      ...saveFile.timelineOptions,
      startDate: dateAtLocalMidnight(saveFile.timelineOptions.startDate),
      endDate: dateAtLocalMidnight(saveFile.timelineOptions.endDate),
    },
  };
}
