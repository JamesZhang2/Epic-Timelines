import type { Epic, ShowBucketHours } from "./EpicTimelines";
import { computeCellColor, relativeLuminance } from "./Util";
import "./TimelineRow.css";

type TimelineRowProps = {
  epicBucketHours: Map<string, number[]>;
  epic: Epic;
  epicIndex: number;
  numEpics: number;
  showBucketHours: ShowBucketHours;
  showReorderButtons: boolean;
  onEpicClick: () => void;
  onMoveEpic: (epicName: string, direction: "up" | "down") => void;
};

/** Represents a timeline for an Epic, which is a row in the Timelines table. */
function TimelineRow({
  epicBucketHours,
  epic,
  epicIndex,
  numEpics,
  showBucketHours,
  showReorderButtons,
  onEpicClick,
  onMoveEpic,
}: TimelineRowProps) {
  const cells = [
    <th key="epic-name" className="epic-name-cell" onClick={onEpicClick}>
      {epic.name}
    </th>,
  ];

  if (showReorderButtons) {
    cells.push(
      <td key="move-up" className="reorder-cell">
        <button
          type="button"
          disabled={epicIndex === 0}
          aria-label={`Move ${epic.name} up`}
          onClick={() => onMoveEpic(epic.name, "up")}
        >
          ↑
        </button>
      </td>,
      <td key="move-down" className="reorder-cell">
        <button
          type="button"
          disabled={epicIndex === numEpics - 1}
          aria-label={`Move ${epic.name} down`}
          onClick={() => onMoveEpic(epic.name, "down")}
        >
          ↓
        </button>
      </td>,
    );
  }

  const epicHours = epicBucketHours.get(epic.name);

  if (!epicHours) {
    throw new Error("epicBucketHours does not contain the name of the Epic");
  }

  const maxHours = Math.max(...epicHours);

  for (const [i, hours] of epicHours.entries()) {
    const cellColor = computeCellColor(hours, maxHours, epic.color);
    const cellStyle = { backgroundColor: cellColor };
    const textStyle = {
      color: relativeLuminance(cellColor) < 0.5 ? "white" : "black",
    };
    let textInCell;
    if (showBucketHours === "all") {
      textInCell = <p style={textStyle}>{hours}</p>;
    } else if (showBucketHours === "nonzero") {
      textInCell = hours > 0 ? <p style={textStyle}>{hours}</p> : <></>;
    } else {
      textInCell = <></>;
    }
    const cell = (
      <td key={i}>
        <div className="colored-cell" style={cellStyle}>
          {textInCell}
        </div>
      </td>
    );
    cells.push(cell);
  }

  const totalHours = epicHours.reduce((acc, num) => acc + num, 0);
  cells.push(
    <td key="row-summary" className="row-summary">
      {totalHours}
    </td>,
  );
  return <tr>{cells}</tr>;
}

export default TimelineRow;
