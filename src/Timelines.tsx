import type { CalendarEvent } from "./Util";
import { hasNontrivialOverlap } from "./Util";
import "./Timelines.css";
import { useRef, useState } from "react";

type TimelinesProps = {
  events: CalendarEvent[];
}

type AddEpicCardProps = {
  // Returns true if epic is successfully added, false otherwise
  onAddEpic: (newEpic: Epic) => boolean;
}

type TimelineRowProps = {
  bucketedEventsList: BucketedEvents[];
  epic: Epic;
  onEpicClick: () => void;
}

type EpicDetailsProps = {
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
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  console.log(timeBuckets);

  function handleAddEpic(newEpic: Epic): boolean {
    for (const epic of epics) {
      if (epic.name === newEpic.name) {
        alert("Error: There is an existing Epic with the name " + epic.name + ". Names of Epics must be unique.");
        return false;
      }
    }

    setEpics([...epics, newEpic]);
    return true;
  }

  function handleEpicClick(epic: Epic) {
    if (selectedEpic?.name === epic.name) {
      // If the Epic is already selected, clicking the name again will unselect it.
      setSelectedEpic(null);
    } else {
      setSelectedEpic(epic);
      console.log("Selected epic: " + epic.name);
    }
  }

  return <div>
    <AddEpicCard onAddEpic={handleAddEpic} />
    <table>
      <thead>
        <tr>
          <th>Epics</th>
          {timeBuckets.map((bucket) => <th key={JSON.stringify(bucket)}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
        </tr>
      </thead>
      <tbody>
        {epics.map((epic) =>
          <>
            <TimelineRow
              bucketedEventsList={bucketedEventsList}
              epic={epic}
              onEpicClick={() => handleEpicClick(epic)}>
            </TimelineRow>
            {selectedEpic && selectedEpic.name === epic.name && <EpicDetails epic={epic} />}
          </>)}
      </tbody>
    </table>
    <pre>Events: {JSON.stringify(events, null, 2)}</pre>
  </div>;
}

/**
 * Represents the card to add a new Epic.
 */
function AddEpicCard({ onAddEpic }: AddEpicCardProps) {
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  function handleAddEpicButtonClick() {
    const newName = epicNameInputRef.current?.value.trim();
    const newKeyword = keywordInputRef.current?.value.trim();
    if (!newName) {
      alert("Error: Please give this Epic a name.");
      return;
    }
    if (!newKeyword) {
      alert("Error: Please provide the keyword to match for in this Epic.")
      return;
    }

    const newEpic: Epic = {
      name: newName,
      keyword: newKeyword
    };
    const success = onAddEpic(newEpic);
    if (success) {
      // Clear input
      epicNameInputRef.current!.value = "";
      keywordInputRef.current!.value = "";
    }
  }

  return <div id="add-epic-div">
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
  </div>;
}

/** Represents a timeline for an epic, which is a row in the Timelines table. */
function TimelineRow({ bucketedEventsList, epic, onEpicClick }: TimelineRowProps) {
  const cells = [<th className="epic-name-cell" onClick={onEpicClick}>{epic.name}</th>];
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
 * Represents the detailed information about an Epic.
 * It's displayed right below the selected Epic, so it's also a row in the Timelines table.
 */
function EpicDetails({ epic }: EpicDetailsProps) {
  return <tr>Details for Epic {epic.name}</tr>;
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