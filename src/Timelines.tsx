import type { CalendarEvent } from "./Util";
import { hasNontrivialOverlap } from "./Util";
import "./Timelines.css";
import { useRef, useState } from "react";

type TimelinesProps = {
  events: CalendarEvent[];
}

type TimelineRowProps = {
  bucketedEventsList: BucketedEvents[];
  epic: Epic;
}

type Epic = {
  name: string;
  keyword: string;
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
  const startDate = new Date("2025-09-21T00:00:00");
  const endDate = new Date("2025-09-27T00:00:00");
  const timeBuckets: TimeBucket[] = generateTimeBuckets(startDate, endDate);
  const bucketedEventsList: BucketedEvents[] = bucketEvents(events, timeBuckets);
  const [epics, setEpics] = useState<Epic[]>([]);
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  console.log(timeBuckets);

  return <div>
    <div id="add-epic-div">
      <p id="add-epic-instructions">Add a new Epic: </p>
      <p id="add-epic-name">
        <label>Name: </label>
        <input type="text" ref={epicNameInputRef}></input>
      </p>
      <p id="add-epic-keyword">
        <label>Keyword:</label>
        <input type="text" ref={keywordInputRef}></input>
      </p>
      <div id="add-epic-button-container">
        <button id="add-epic-button" onClick={handleAddEpicButtonClick}>Add</button>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Epics</th>
          {timeBuckets.map((bucket) => <th key={JSON.stringify(bucket)}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
        </tr>
      </thead>
      <tbody>
        {epics.map((epic) => <TimelineRow bucketedEventsList={bucketedEventsList} epic={epic}></TimelineRow>)}
      </tbody>
    </table>
    <pre>Events: {JSON.stringify(events, null, 2)}</pre>
  </div>;

  function handleAddEpicButtonClick() {
    const newName = epicNameInputRef.current?.value.trim();
    const newKeyword = keywordInputRef.current?.value.trim();
    if (newName && newKeyword) {
      let foundDuplicateName = false;
      for (const epic of epics) {
        if (epic.name === newName) {
          alert("There is an existing Epic with the name " + epic.name + ". Names of Epics must be unique.");
          foundDuplicateName = true;
          break;
        }
      }
      if (!foundDuplicateName) {
        const newEpic: Epic = {
          name: newName,
          keyword: newKeyword
        };
        setEpics([...epics, newEpic]);
        epicNameInputRef.current!.value = "";  // Clear input
        keywordInputRef.current!.value = "";  // Clear input
      }
    }
  }
}

/** Represents a timeline for an epic, which is a row in the Timelines table. */
function TimelineRow({ bucketedEventsList, epic }: TimelineRowProps) {
  const cells = [<th>{epic.name}</th>];
  for (const bucketedEvents of bucketedEventsList) {
    let foundMatch = false;
    for (const event of bucketedEvents.events) {
      if (event.title.match(epic.keyword) !== null ||
        (event.description !== undefined && event.description.match(epic.keyword) !== null)) {
        foundMatch = true;
        break;
      }
    }
    cells.push(foundMatch ? <td className="colored"></td> : <td></td>);
  }
  return <tr>{cells}</tr>;
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