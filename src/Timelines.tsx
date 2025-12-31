import type { Epic, TimeBucket } from "./EpicTimelines";
import TimelineRow from "./TimelineRow";
import EpicDetails from "./EpicDetails";
import React from "react";
import "./Timelines.css";

type TimelinesProps = {
  epics: Epic[];
  timeBuckets: TimeBucket[];
  epicBucketHours: Map<string, number[]>;
  selectedEpic: Epic | null;
  onEpicClick: (epic: Epic) => void;
  onEditEpic: (oldEpicName: string, updatedEpic: Epic) => boolean;
  onDeleteEpic: (epicName: string) => void;
}

function Timelines({ epics, timeBuckets, epicBucketHours, selectedEpic, onEpicClick, onEditEpic, onDeleteEpic }: TimelinesProps) {
  return (
    <table id="timelines-table">
      <thead>
        <tr>
          <th>Epics</th>
          {timeBuckets.map((bucket) => <th key={bucket.start.toISOString()}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
        </tr>
      </thead>
      <tbody>
        {epics.map((epic) =>
          <React.Fragment key={epic.name}>
            <TimelineRow
              epicBucketHours={epicBucketHours}
              epic={epic}
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