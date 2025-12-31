import { colorToRGB, rgbToColor } from "./Util";
import type { Epic, TimeBucket } from "./EpicTimelines";
import EpicDetails from "./EpicDetails";
import React from "react";

type TimelineRowProps = {
  epicBucketHours: Map<string, number[]>;
  epic: Epic;
  onEpicClick: () => void;
}

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

/** Represents a timeline for an epic, which is a row in the Timelines table. */
function TimelineRow({ epicBucketHours, epic, onEpicClick }: TimelineRowProps) {
  const cells = [<th className="epic-name-cell" onClick={onEpicClick}>{epic.name}</th>];

  const epicHours = epicBucketHours.get(epic.name);

  if (!epicHours) {
    throw new Error("epicBucketHours does not contain the name of the Epic")
  }

  const maxHours = Math.max(...epicHours);

  for (const [i, hours] of epicHours.entries()) {
    const cellColor = computeCellColor(hours, maxHours, epic.color);
    const style = { backgroundColor: cellColor };
    cells.push(<td key={i}><div className="colored-cell" style={style}></div></td>);
  }
  return <tr>{cells}</tr>;
}

/**
 * Compute the color for a cell based on the number hours in this bucket,
 * the max number of hours, and the color of the Epic.
 */
function computeCellColor(hours: number, maxHours: number, epicColor: string): string {
  if (hours === 0) {
    return "#ffffff";
  }
  const rgb = colorToRGB(epicColor);
  const factor = Math.max(hours / maxHours, 0.25);
  const newR = Math.floor(255 - (255 - rgb[0]) * factor);
  const newG = Math.floor(255 - (255 - rgb[1]) * factor);
  const newB = Math.floor(255 - (255 - rgb[2]) * factor);
  return rgbToColor(newR, newG, newB);
}

export default Timelines;