import type { CalendarEvent } from "./Util";
import { bucketEvents, computeEpicBucketHours, generateTimeBuckets } from "./BucketUtil";
import AddEpicCard from "./AddEpicCard";
import Timelines from "./Timelines";
import { useMemo, useState } from "react";
import "./EpicTimelines.css";
import OptionsCard from "./OptionsCard";

type EpicTimelinesProps = {
  events: CalendarEvent[];
}

export type Epic = {
  name: string;  // Must be unique.
  keyword: string;
  caseSensitive: boolean;
  color: string;
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

export type BucketGranularity = "day" | "week" | "month" | "3 months" | "year";

export type TimelineOptions = {
  startDate: Date;
  endDate: Date;
  bucketGranularity: BucketGranularity;
}

/** Top-level component */
function EpicTimelines({ events }: EpicTimelinesProps) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const defaultTimelineOptions = {
    startDate: weekAgo,
    endDate: today,
    bucketGranularity: "day" as BucketGranularity
  };
  const [timelineOptions, setTimelineOptions] = useState<TimelineOptions>(defaultTimelineOptions);
  let timeBuckets: TimeBucket[];
  switch (timelineOptions.bucketGranularity) {
    case "day":
      timeBuckets = generateTimeBuckets(timelineOptions.startDate, timelineOptions.endDate, 0, 0, 1);
      break;
    case "week":
      timeBuckets = generateTimeBuckets(timelineOptions.startDate, timelineOptions.endDate, 0, 0, 7);
      break;
    case "month":
      timeBuckets = generateTimeBuckets(timelineOptions.startDate, timelineOptions.endDate, 0, 1, 0);
      break;
    case "3 months":
      timeBuckets = generateTimeBuckets(timelineOptions.startDate, timelineOptions.endDate, 0, 3, 0);
      break;
    case "year":
      timeBuckets = generateTimeBuckets(timelineOptions.startDate, timelineOptions.endDate, 1, 0, 0);
      break;
  }
  const bucketedEventsList: BucketedEvents[] = bucketEvents(events, timeBuckets);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);

  // The number of hours in each bucket of each Epic.
  const epicBucketHours: Map<string, number[]> = useMemo(
    () => computeEpicBucketHours(epics, bucketedEventsList),
    [epics, bucketedEventsList]);

  /**
   * Throws an error if the names of the epics are not unique.
   * No-op otherwise.
   */
  function assertEpicNamesUnique(epics: Epic[]) {
    const names = epics.map((e) => e.name);
    const uniqueNames = new Set(names);
    if (names.length != uniqueNames.size) {
      throw new Error("Epic names must be unique. Current Epics: " + epics);
    }
  }

  /**
   * Returns true if the Epic was added, and false otherwise.
   */
  function handleAddEpic(newEpic: Epic): boolean {
    for (const epic of epics) {
      if (epic.name === newEpic.name) {
        alert("Error: Failed to add Epic. There is an existing Epic with the name " + epic.name + ". Names of Epics must be unique.");
        return false;
      }
    }

    const newEpics: Epic[] = [...epics, newEpic]
    assertEpicNamesUnique(newEpics);
    setEpics(newEpics);
    setSelectedEpic(null);
    return true;
  }

  /**
   * Requires: epicName is the name of one of the epics in the list of epics.
   */
  function handleDeleteEpic(epicName: string) {
    const newEpics: Epic[] = epics.filter((e) => e.name !== epicName);
    assertEpicNamesUnique(newEpics);
    setEpics(newEpics);
    setSelectedEpic(null);
  }

  /**
   * Returns true if the Epic was updated, and false otherwise.
   */
  function handleEditEpic(oldEpicName: string, updatedEpic: Epic): boolean {
    const newEpics: Epic[] = [];
    for (const epic of epics) {
      if (epic.name !== oldEpicName) {
        // not the epic that we're trying to replace
        if (epic.name == updatedEpic.name) {
          alert("Error: Failed to update Epic. There is an existing Epic with the name " + epic.name + ". Names of Epics must be unique.");
          return false;
        } else {
          newEpics.push(epic);
        }
      } else {
        // this is the epic we're trying to replace
        newEpics.push(updatedEpic);
      }
    }

    assertEpicNamesUnique(newEpics);
    setEpics(newEpics);
    setSelectedEpic(updatedEpic);
    return true;
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
    <div id="card-container">
      <AddEpicCard onAddEpic={handleAddEpic} />
      <OptionsCard timelineOptions={timelineOptions} setTimelineOptions={setTimelineOptions} />
    </div>
    <Timelines
      epics={epics}
      timeBuckets={timeBuckets}
      epicBucketHours={epicBucketHours}
      selectedEpic={selectedEpic}
      onEpicClick={handleEpicClick}
      onEditEpic={handleEditEpic}
      onDeleteEpic={handleDeleteEpic} />
    <pre>Events: {JSON.stringify(events, null, 2)}</pre>
  </div>;
}

export default EpicTimelines;