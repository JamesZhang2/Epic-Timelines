import type { TimeBucket } from "./Timelines.types";
import "./TimelineHeader.css";

type TimelineHeaderProps = {
  timeBuckets: TimeBucket[];
  showReorderButtons: boolean;
};

function formatDate(date: Date, showYear: boolean) {
  if (showYear) {
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + (date.getFullYear() % 100);
  } else {
    return date.getMonth() + 1 + "/" + date.getDate();
  }
}

function TimelineHeader({ timeBuckets, showReorderButtons }: TimelineHeaderProps) {
  const headerCells = [];
  headerCells.push(<th key="epics">Epics</th>);

  if (showReorderButtons) {
    headerCells.push(
      <th key="move-up" className="reorder-header-cell">
        ↑
      </th>,
    );
    headerCells.push(
      <th key="move-down" className="reorder-header-cell">
        ↓
      </th>,
    );
  }

  for (let i = 0; i < timeBuckets.length; i++) {
    const showYear =
      i === 0 || timeBuckets[i].start.getFullYear() !== timeBuckets[i - 1].start.getFullYear();
    headerCells.push(
      <th key={timeBuckets[i].start.toISOString()}>
        {formatDate(timeBuckets[i].start, showYear)}
      </th>,
    );
  }
  headerCells.push(<th key="total">Total</th>);
  return (
    <thead>
      <tr>{headerCells}</tr>
    </thead>
  );
}

export default TimelineHeader;
