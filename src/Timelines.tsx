import type { Epic, ShowBucketHours, TimeBucket } from "./EpicTimelines";
import TimelineRow from "./TimelineRow";
import EpicDetails from "./EpicDetails";
import React from "react";
import "./Timelines.css";
import TimelineHeader from "./TimelineHeader";
import { computeGlobalMaxBucketHours } from "./BucketUtil";

type TimelinesProps = {
  epics: Epic[];
  timeBuckets: TimeBucket[];
  epicBucketHours: Map<string, number[]>;
  showBucketHours: ShowBucketHours;
  useGlobalColor: boolean;
  globalColor: string;
  useGlobalScale: boolean;
  showReorderButtons: boolean;
  selectedEpic: Epic | null;
  onEpicClick: (epic: Epic) => void;
  onMoveEpic: (epicName: string, direction: "up" | "down") => void;
  onEditEpic: (oldEpicName: string, updatedEpic: Epic) => boolean;
  onDeleteEpic: (epicName: string) => void;
};

function Timelines({
  epics,
  timeBuckets,
  epicBucketHours,
  showBucketHours,
  useGlobalColor,
  globalColor,
  useGlobalScale,
  showReorderButtons,
  selectedEpic,
  onEpicClick,
  onMoveEpic,
  onEditEpic,
  onDeleteEpic,
}: TimelinesProps) {
  const numColsForDetails = timeBuckets.length + (showReorderButtons ? 3 : 1);
  const globalMaxBucketHours = computeGlobalMaxBucketHours(epicBucketHours);

  return (
    <table id="timelines-table">
      <TimelineHeader timeBuckets={timeBuckets} showReorderButtons={showReorderButtons} />
      <tbody>
        {epics.map((epic, index) => (
          <React.Fragment key={epic.name}>
            <TimelineRow
              epicBucketHours={epicBucketHours}
              epic={epic}
              epicIndex={index}
              numEpics={epics.length}
              showBucketHours={showBucketHours}
              useGlobalColor={useGlobalColor}
              globalColor={globalColor}
              useGlobalScale={useGlobalScale}
              globalMaxBucketHours={globalMaxBucketHours}
              showReorderButtons={showReorderButtons}
              onEpicClick={() => onEpicClick(epic)}
              onMoveEpic={onMoveEpic}
            />
            {selectedEpic && selectedEpic.name === epic.name && (
              <EpicDetails
                epic={epic}
                numCols={numColsForDetails}
                onDeleteEpic={onDeleteEpic}
                onEditEpic={onEditEpic}
              />
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default Timelines;
