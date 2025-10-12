import type { CalendarEvent } from "./Util";
import { hasNontrivialOverlap } from "./Util";
import "./Timelines.css";
import { useEffect, useRef, useState } from "react";

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
  numCols: number;
  onDeleteEpic: (epicName: string) => void;
}

type Epic = {
  name: string;  // Must be unique.
  keyword: string;
  caseSensitive: boolean;
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

  function handleAddEpic(newEpic: Epic): boolean {
    for (const epic of epics) {
      if (epic.name === newEpic.name) {
        alert("Error: There is an existing Epic with the name " + epic.name + ". Names of Epics must be unique.");
        return false;
      }
    }

    setEpics([...epics, newEpic]);
    setSelectedEpic(null);
    return true;
  }

  /**
   * Requires: epicName is the name of one of the epics in the list of epics.
   */
  function handleDeleteEpic(epicName: string) {
    setEpics(epics.filter((e) => e.name !== epicName));
    setSelectedEpic(null);
  }

  function handleEpicClick(epic: Epic) {
    if (selectedEpic?.name === epic.name) {
      // If the Epic is already selected, clicking the name again will unselect it.
      setSelectedEpic(null);
    } else {
      setSelectedEpic(epic);
    }
  }

  return <div>
    <AddEpicCard onAddEpic={handleAddEpic} />
    <table id="timelines-table">
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
              onEpicClick={() => handleEpicClick(epic)} />
            {selectedEpic && selectedEpic.name === epic.name &&
              <EpicDetails
                epic={epic}
                numCols={timeBuckets.length + 1}
                onDeleteEpic={handleDeleteEpic} />}
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
  const caseSensitiveRef = useRef<HTMLInputElement>(null);

  function handleAddEpicButtonClick() {
    const newName = epicNameInputRef.current?.value.trim();
    const newKeyword = keywordInputRef.current?.value.trim();
    const caseSensitive = caseSensitiveRef.current?.checked ?? false;

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
      keyword: newKeyword,
      caseSensitive: caseSensitive
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
      <input type="text" ref={epicNameInputRef} />
    </p>
    <p id="add-epic-keyword">
      <label>Keyword:</label>
      <input type="text" ref={keywordInputRef} />
    </p>
    <label id="add-epic-case-sensitive-checkbox">
      Case sensitive:
      <input type="checkbox" ref={caseSensitiveRef} />
    </label>
    <div id="add-epic-button-container">
      <button id="add-epic-button" onClick={handleAddEpicButtonClick}>Add</button>
    </div>
  </div>;
}

/** Represents a timeline for an epic, which is a row in the Timelines table. */
function TimelineRow({ bucketedEventsList, epic, onEpicClick }: TimelineRowProps) {
  const cells = [<th className="epic-name-cell" onClick={onEpicClick}>{epic.name}</th>];
  const regex = new RegExp(epic.keyword, epic.caseSensitive ? "" : "i");  // i: ignore case flag

  for (const bucketedEvents of bucketedEventsList) {
    let foundMatch = false;
    for (const event of bucketedEvents.events) {
      if (regex.test(event.title) ||
        (event.description !== undefined && regex.test(event.description))) {
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
function EpicDetails({ epic, numCols, onDeleteEpic }: EpicDetailsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [editingEpic, setEditingEpic] = useState<boolean>(false);
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const caseSensitiveRef = useRef<HTMLInputElement>(null);

  function handleDeleteEpicButtonClick(epicName: string) {
    if (confirmingDelete) {
      // User pressed again, delete Epic
      onDeleteEpic(epicName);
    } else {
      setConfirmingDelete(true);
    }
  }

  function handleEditEpicButtonClick() {
    setEditingEpic(!editingEpic);
  }

  useEffect(() => {
    if (!confirmingDelete) {
      return;
    }
    const timer = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  return <tr className="epic-details">
    <td colSpan={numCols}>
      {editingEpic ?
        <>
          <p>
            <strong>Name:</strong> <input type="text" defaultValue={epic.name} ref={epicNameInputRef} />
          </p>
          <p>
            <strong>Keyword:</strong> <input type="text" defaultValue={epic.keyword} ref={keywordInputRef} />
          </p>
          <p>
            <strong>Case sensitive:</strong> <input type="checkbox" defaultChecked={epic.caseSensitive} ref={caseSensitiveRef} />
          </p>
        </> :
        <>
          <p><strong>Name:</strong> {epic.name}</p>
          <p><strong>Keyword:</strong> {epic.keyword}</p>
          <p><strong>Case sensitive:</strong> {epic.caseSensitive ? "Yes" : "No"}</p>
        </>}
      <button id="edit-epic-button" onClick={() => handleEditEpicButtonClick()}>
        {editingEpic ? "Confirm" : "Edit Epic"}
      </button>
      <button id="delete-epic-button" onClick={() => handleDeleteEpicButtonClick(epic.name)}>
        {confirmingDelete ? "Are you sure?" : "Delete Epic"}
      </button>
    </td>
  </tr>;
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