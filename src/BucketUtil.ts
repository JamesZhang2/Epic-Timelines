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
 * Generates time buckets based on the start date and end date (both inclusive).
 * If startDate == endDate, exactly one bucket will be generated.
 * endDate must be later than or equal to startDate.
 * Exactly one of yearDelta, monthDelta, and dayDelta is nonzero and positive.
 * Each time bucket interval has length equal to yearDelta years
 * or monthDelta months or dayDelta days, whichever is nonzero.
 * We use anchor-day semantics: If a day doesn't exist in a month,
 * we clamp to the last day of the month.
 */
export function generateTimeBuckets(startDate: Date, endDate: Date, yearDelta: number, monthDelta: number, dayDelta: number): TimeBucket[] {
  if (yearDelta < 0 || monthDelta < 0 || dayDelta < 0) {
    throw new Error("All deltas must be nonnegative.")
  }
  const nonzeroCount = (yearDelta != 0 ? 1 : 0) + (monthDelta != 0 ? 1 : 0) + (dayDelta != 0 ? 1 : 0);
  if (nonzeroCount != 1) {
    throw new Error("Exactly one of yearDelta, monthDelta, and dayDelta must be nonzero.")
  }
  if (startDate > endDate) {
    throw new Error("endDate must be later than or equal to startDate.")
  }

  const timeBuckets = [];
  let curDate = new Date(startDate);
  while (curDate <= endDate) {
    let end: Date;
    if (dayDelta != 0) {
      end = new Date(curDate);
      end.setDate(curDate.getDate() + dayDelta);
    } else if (monthDelta != 0) {
      const newYear = curDate.getFullYear() + Math.floor((curDate.getMonth() + monthDelta) / 12);
      const newMonth = (curDate.getMonth() + monthDelta) % 12;
      const newDate = Math.min(startDate.getDate(), lastDayOfMonth(newYear, newMonth));
      end = new Date(newYear, newMonth, newDate, 0, 0, 0, 0);
    } else {
      // yearDelta != 0
      const newYear = curDate.getFullYear() + yearDelta;
      const newMonth = startDate.getMonth();
      const newDate = Math.min(startDate.getDate(), lastDayOfMonth(newYear, startDate.getMonth()));
      end = new Date(newYear, newMonth, newDate, 0, 0, 0, 0);
    }
    timeBuckets.push({
      start: new Date(curDate),
      end: end
    });
    curDate = new Date(end);
  }
  return timeBuckets;
}

/** January is the 0th month, consistent with Typescript Date. */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
