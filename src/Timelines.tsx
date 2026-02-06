import type { Epic, ShowBucketHours, TimeBucket } from "./EpicTimelines";
import TimelineRow from "./TimelineRow";
import EpicDetails from "./EpicDetails";
import React from "react";
import "./Timelines.css";
import TimelineHeader from "./TimelineHeader";

type TimelinesProps = {
  epics: Epic[];
  timeBuckets: TimeBucket[];
  epicBucketHours: Map<string, number[]>;
  showBucketHours: ShowBucketHours;
  selectedEpic: Epic | null;
  onEpicClick: (epic: Epic) => void;
  onEditEpic: (oldEpicName: string, updatedEpic: Epic) => boolean;
  onDeleteEpic: (epicName: string) => void;
}

function Timelines(
  { epics,
    timeBuckets,
    epicBucketHours,
    showBucketHours,
    selectedEpic,
    onEpicClick,
    onEditEpic,
    onDeleteEpic }: TimelinesProps) {
  return (
    <table id="timelines-table">
      <TimelineHeader timeBuckets={timeBuckets} />
      <tbody>
        {epics.map((epic) =>
          <React.Fragment key={epic.name}>
            <TimelineRow
              epicBucketHours={epicBucketHours}
              epic={epic}
              showBucketHours={showBucketHours}
              onEpicClick={() => onEpicClick(epic)} />
            {selectedEpic && selectedEpic.name === epic.name &&
              <EpicDetails
                epic={epic}
                numCols={timeBuckets.length + 1}
                onDeleteEpic={onDeleteEpic}
                onEditEpic={onEditEpic} />}
          </React.Fragment>)}
      </tbody>
    </table>
  );
}

export default Timelines;