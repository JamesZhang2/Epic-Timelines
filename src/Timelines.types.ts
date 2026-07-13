import type { CalendarEvent } from "./ICSParser";

export type Epic = {
  name: string; // Must be unique.
  keyword: string;
  caseSensitive: boolean;
  color: string;
  matchTitle: boolean;
  matchDescription: boolean;
  matchLocation: boolean;
};

export type TimeBucket = {
  start: Date;
  end: Date;
};

/**
 * Represents a list of events with nontrivial overlap with the given time bucket.
 */
export type BucketedEvents = {
  bucket: TimeBucket;
  events: CalendarEvent[];
};

export const BUCKET_GRANULARITIES = ["day", "week", "month", "3 months", "year"] as const;
export type BucketGranularity = (typeof BUCKET_GRANULARITIES)[number];

export const SHOW_BUCKET_HOURS = ["all", "nonzero", "none"] as const;
export type ShowBucketHours = (typeof SHOW_BUCKET_HOURS)[number];

export type TimelineOptions = {
  startDate: Date;
  endDate: Date;
  bucketGranularity: BucketGranularity;
  showBucketHours: ShowBucketHours;
  ignoreAllDayEvents: boolean;
  useGlobalColor: boolean;
  useGlobalScale: boolean;
  globalColor: string;
};
