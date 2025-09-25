import type { CalendarEvent } from "./Util";
import { hasNontrivialOverlap } from "./Util";

type TimelinesProps = {
  events: CalendarEvent[];
}

export type TimeBucket = {
  start: Date;
  end: Date;
}

/**
 * Represents a list of events with nontrivial overlap with the given time bucket.
 */
export type BucketedEvents = {
  bucket: TimeBucket;
  events: CalendarEvent[];
}

function Timelines({ events }: TimelinesProps) {
  const startDate = new Date("2025-09-22T00:00:00");
  const endDate = new Date("2025-09-28T00:00:00");
  const timeBuckets: TimeBucket[] = generateTimeBuckets(startDate, endDate);
  console.log(timeBuckets);

  return <div>
    <table>
      <thead>
        <tr>
          <th>Epics</th>
          {timeBuckets.map((bucket) => <th key={JSON.stringify(bucket)}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
        </tr>
      </thead>
      <tbody>

      </tbody>
    </table>
    <pre>Events: {JSON.stringify(events, null, 2)}</pre>
  </div>;
}

/**
 * Generates time buckets based on the start date and end date. Each time bucket interval is 1 day.
 */
export function generateTimeBuckets(startDate: Date, endDate: Date): TimeBucket[] {
  const timeBuckets = [];
  let curDate = startDate;
  while (curDate <= endDate) {
    let end = new Date(curDate);
    end.setDate(end.getDate() + 1);
    timeBuckets.push({
      start: new Date(curDate),
      end: end
    });
    curDate.setDate(curDate.getDate() + 1);
  }
  return timeBuckets;
}

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

export default Timelines;