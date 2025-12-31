import { colorToRGB, rgbToColor } from "./Util";
import { useEffect, useRef, useState } from "react";
import type { Epic, TimeBucket } from "./EpicTimelines";

type TimelineRowProps = {
  epicBucketHours: Map<string, number[]>;
  epic: Epic;
  onEpicClick: () => void;
}

type EpicDetailsProps = {
  epic: Epic;
  numCols: number;
  onDeleteEpic: (epicName: string) => void;
  onEditEpic: (oldEpicName: string, newEpic: Epic) => boolean;
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
          {timeBuckets.map((bucket) => <th key={JSON.stringify(bucket)}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
        </tr>
      </thead>
      <tbody>
        {epics.map((epic) =>
          <>
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
          </>)}
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

/**
 * Represents the detailed information about an Epic.
 * It's displayed right below the selected Epic, so it's also a row in the Timelines table.
 */
function EpicDetails({ epic, numCols, onDeleteEpic, onEditEpic }: EpicDetailsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [editingEpic, setEditingEpic] = useState<boolean>(false);
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const caseSensitiveRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  function handleDeleteEpicButtonClick(epicName: string) {
    if (confirmingDelete) {
      // User pressed again, delete Epic
      onDeleteEpic(epicName);
    } else {
      setConfirmingDelete(true);
    }
  }

  function handleEditEpicButtonClick(oldEpicName: string) {
    if (editingEpic) {
      const updatedName = epicNameInputRef.current?.value.trim();
      const updatedKeyword = keywordInputRef.current?.value.trim();
      const updatedCaseSensitive = caseSensitiveRef.current?.checked ?? false;
      const updatedColor = colorRef.current?.value || "#7799ff";

      if (!updatedName) {
        alert("Error: The updated Epic must have a name.");
        return;
      }
      if (!updatedKeyword) {
        alert("Error: The updated Epic must have a keyword to match for.")
        return;
      }

      const updatedEpic: Epic = {
        name: updatedName,
        keyword: updatedKeyword,
        caseSensitive: updatedCaseSensitive,
        color: updatedColor
      }

      onEditEpic(oldEpicName, updatedEpic);
      setEditingEpic(false);
    } else {
      setEditingEpic(true);
    }
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
          <p>
            <strong>Color: </strong> <input type="color" defaultValue={epic.color} ref={colorRef} />
          </p>
        </> :
        <>
          <p><strong>Name:</strong> {epic.name}</p>
          <p><strong>Keyword:</strong> {epic.keyword}</p>
          <p><strong>Case sensitive:</strong> {epic.caseSensitive ? "Yes" : "No"}</p>
        </>}
      <div id="epic-details-button-container">
        <button id="edit-epic-button" onClick={() => handleEditEpicButtonClick(epic.name)}>
          {editingEpic ? "Confirm" : "Edit Epic"}
        </button>
        <button id="delete-epic-button" onClick={() => handleDeleteEpicButtonClick(epic.name)}>
          {confirmingDelete ? "Are you sure?" : "Delete Epic"}
        </button>
      </div>
    </td>
  </tr>;
}

export default Timelines;