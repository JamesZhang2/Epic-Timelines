import type { Epic } from "./EpicTimelines";
import { colorToRGB, relativeLuminance, rgbToColor } from "./Util";
import "./TimelineRow.css";

type TimelineRowProps = {
  epicBucketHours: Map<string, number[]>;
  epic: Epic;
  onEpicClick: () => void;
}

/** Represents a timeline for an Epic, which is a row in the Timelines table. */
function TimelineRow({ epicBucketHours, epic, onEpicClick }: TimelineRowProps) {
  const cells = [<th className="epic-name-cell" onClick={onEpicClick}>{epic.name}</th>];

  const epicHours = epicBucketHours.get(epic.name);

  if (!epicHours) {
    throw new Error("epicBucketHours does not contain the name of the Epic")
  }

  const maxHours = Math.max(...epicHours);

  for (const [i, hours] of epicHours.entries()) {
    const cellColor = computeCellColor(hours, maxHours, epic.color);
    const cellStyle = { backgroundColor: cellColor };
    const textStyle = { color: (relativeLuminance(cellColor) < 0.5 ? "white" : "black") };
    const cell = <td key={i}>
      <div className="colored-cell" style={cellStyle}>
        <p style={textStyle}>{hours}</p>
      </div>
    </td>;
    cells.push(cell);
  }

  const totalHours = epicHours.reduce((acc, num) => acc + num, 0);
  cells.push(<td className="row-summary">{totalHours}</td>);
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

export default TimelineRow;