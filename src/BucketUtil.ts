/** This file contains helper functions for dealing with time buckets. */

import { computeOverlapHours, hasNontrivialOverlap } from "./Util";
import type { CalendarEvent } from "./Util";
import type { TimeBucket, BucketedEvents, Epic } from "./EpicTimelines";

/**
 * @returns a list of BucketedEvents, one for each bucket in buckets.
 * Each BucketedEvents is the subset of events with a nontrivial overlap with the time bucket.
 */
export function bucketEvents(events: CalendarEvent[], buckets: TimeBucket[]): BucketedEvents[] {
  const result: BucketedEvents[] = [];
  for (const bucket of buckets) {
    const filteredEvents = [];
    for (const event of events) {
      if (hasNontrivialOverlap(bucket.start, bucket.end, event.start, event.end)) {
        filteredEvents.push(structuredClone(event));
      }
    }
    result.push({
      bucket: bucket,
      events: filteredEvents
    })
  }
  return result;
}

/**
 * @returns a map that maps Epic names to number of hours in each bucket,
 * where the buckets are in the same order as the ones in the bucketedEventsList.
 */
export function computeEpicBucketHours(epics: Epic[], bucketedEventsList: BucketedEvents[]): Map<string, number[]> {
  const result: Map<string, number[]> = new Map();
  for (const epic of epics) {
    const regex = new RegExp(epic.keyword, epic.caseSensitive ? "" : "i");  // i: ignore case flag
    const epicHours: number[] = [];

    for (const bucketedEvents of bucketedEventsList) {
      const timeBucket = bucketedEvents.bucket;
      let epicHoursInThisBucket = 0;

      for (const event of bucketedEvents.events) {
        if (regex.test(event.title) ||
          (event.description !== undefined && regex.test(event.description))) {
          epicHoursInThisBucket += computeOverlapHours(event.start, event.end, timeBucket.start, timeBucket.end);
        }
      }
      epicHours.push(epicHoursInThisBucket);
    }
    result.set(epic.name, epicHours);
  }
  return result;
}

/**
 * Generates time buckets based on the start date and end date. Each time bucket interval is 1 day.
 */
export function generateTimeBuckets(startDate: Date, endDate: Date): TimeBucket[] {
  const timeBuckets = [];
  const curDate = startDate;
  while (curDate <= endDate) {
    const end = new Date(curDate);
    end.setDate(end.getDate() + 1);
    timeBuckets.push({
      start: new Date(curDate),
      end: end
    });
    curDate.setDate(curDate.getDate() + 1);
  }
  return timeBuckets;
}
