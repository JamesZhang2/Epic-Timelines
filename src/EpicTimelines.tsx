import { parseICSToCalendarEventsInRange, type CalendarEvent } from "./ICSParser";
import { bucketEvents, computeEpicBucketHours, generateTimeBuckets } from "./BucketUtil";
import { filterOutAllDayEvents } from "./EventUtil";
import AddEpicCard from "./AddEpicCard";
import Timelines from "./Timelines";
import { useMemo, useState } from "react";
import "./EpicTimelines.css";
import OptionsCard from "./OptionsCard";
import SaveLoadCard from "./SaveLoadCard";

type EpicTimelinesProps = {
  icsText: string;
};

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

export type BucketGranularity = "day" | "week" | "month" | "3 months" | "year";

export type ShowBucketHours = "all" | "nonzero" | "none";

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

/** Top-level component */
function EpicTimelines({ icsText }: EpicTimelinesProps) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const defaultTimelineOptions = {
    startDate: weekAgo,
    endDate: today,
    bucketGranularity: "day" as BucketGranularity,
    showBucketHours: "nonzero" as ShowBucketHours,
    ignoreAllDayEvents: true,
    useGlobalColor: false,
    useGlobalScale: false,
    globalColor: "#2f80ed",
  };
  const [timelineOptions, setTimelineOptions] = useState<TimelineOptions>(defaultTimelineOptions);
  const parsedEvents = useMemo(() => {
    const parseStartedAt = performance.now();
    const events = parseICSToCalendarEventsInRange(
      icsText,
      timelineOptions.startDate,
      timelineOptions.endDate,
    );
    const parseDelayMs = performance.now() - parseStartedAt;

    console.info(`ICS parsed in ${parseDelayMs.toFixed(1)}ms.`);
    return events;
  }, [icsText, timelineOptions.startDate, timelineOptions.endDate]);
  const events = useMemo(
    () => (timelineOptions.ignoreAllDayEvents ? filterOutAllDayEvents(parsedEvents) : parsedEvents),
    [parsedEvents, timelineOptions.ignoreAllDayEvents],
  );
  let timeBuckets: TimeBucket[];
  switch (timelineOptions.bucketGranularity) {
    case "day":
      timeBuckets = generateTimeBuckets(
        timelineOptions.startDate,
        timelineOptions.endDate,
        0,
        0,
        1,
      );
      break;
    case "week":
      timeBuckets = generateTimeBuckets(
        timelineOptions.startDate,
        timelineOptions.endDate,
        0,
        0,
        7,
      );
      break;
    case "month":
      timeBuckets = generateTimeBuckets(
        timelineOptions.startDate,
        timelineOptions.endDate,
        0,
        1,
        0,
      );
      break;
    case "3 months":
      timeBuckets = generateTimeBuckets(
        timelineOptions.startDate,
        timelineOptions.endDate,
        0,
        3,
        0,
      );
      break;
    case "year":
      timeBuckets = generateTimeBuckets(
        timelineOptions.startDate,
        timelineOptions.endDate,
        1,
        0,
        0,
      );
      break;
  }
  const bucketedEventsList: BucketedEvents[] = bucketEvents(events, timeBuckets);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [reorderingEpics, setReorderingEpics] = useState<boolean>(false);

  // The number of hours in each bucket of each Epic.
  const epicBucketHours: Map<string, number[]> = useMemo(
    () => computeEpicBucketHours(epics, bucketedEventsList),
    [epics, bucketedEventsList],
  );

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
        const errorMessage =
          `Error: Failed to add Epic. There is an existing Epic with the name ${epic.name}. ` +
          `Names of Epics must be unique.`;
        alert(errorMessage);
        return false;
      }
    }

    const newEpics: Epic[] = [...epics, newEpic];
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
   * Moves the Epic with the given name in the given direction.
   */
  function handleMoveEpic(epicName: string, direction: "up" | "down") {
    const index = epics.findIndex((epic) => epic.name === epicName);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || newIndex < 0 || newIndex >= epics.length) {
      return;
    }

    const newEpics = [...epics];
    [newEpics[index], newEpics[newIndex]] = [newEpics[newIndex], newEpics[index]];
    assertEpicNamesUnique(newEpics);
    setEpics(newEpics);
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
          const errorMessage =
            `Error: Failed to add Epic. There is an existing Epic with the name ${epic.name}. ` +
            `Names of Epics must be unique.`;
          alert(errorMessage);
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

  return (
    <div id="epic-timelines-container">
      <div id="card-container">
        <AddEpicCard onAddEpic={handleAddEpic} />
        <OptionsCard timelineOptions={timelineOptions} setTimelineOptions={setTimelineOptions} />
      </div>
      <div id="save-load-container">
        <SaveLoadCard />
      </div>
      <Timelines
        epics={epics}
        timeBuckets={timeBuckets}
        epicBucketHours={epicBucketHours}
        showBucketHours={timelineOptions.showBucketHours}
        useGlobalColor={timelineOptions.useGlobalColor}
        globalColor={timelineOptions.globalColor}
        useGlobalScale={timelineOptions.useGlobalScale}
        showReorderButtons={reorderingEpics}
        selectedEpic={selectedEpic}
        onEpicClick={handleEpicClick}
        onMoveEpic={handleMoveEpic}
        onEditEpic={handleEditEpic}
        onDeleteEpic={handleDeleteEpic}
      />
      <div id="toggle-epic-reorder-button-container">
        <button
          id="toggle-epic-reorder-button"
          type="button"
          onClick={() => setReorderingEpics((current) => !current)}
        >
          {reorderingEpics ? "Done" : "Reorder Epics"}
        </button>
      </div>
    </div>
  );
}

export default EpicTimelines;
