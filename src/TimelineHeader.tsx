import type { TimeBucket } from "./EpicTimelines";
import "./TimelineHeader.css";

type TimelineHeaderProps = {
  timeBuckets: TimeBucket[];
};

function formatDate(date: Date, showYear: boolean) {
  if (showYear) {
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + (date.getFullYear() % 100);
  } else {
    return date.getMonth() + 1 + "/" + date.getDate();
  }
}

function TimelineHeader({ timeBuckets }: TimelineHeaderProps) {
  const headerCells = [];
  headerCells.push(<th>Epics</th>);
  for (let i = 0; i < timeBuckets.length; i++) {
    const showYear =
      i === 0 || timeBuckets[i].start.getFullYear() !== timeBuckets[i - 1].start.getFullYear();
    headerCells.push(
      <th key={timeBuckets[i].start.toISOString()}>
        {formatDate(timeBuckets[i].start, showYear)}
      </th>,
    );
  }
  headerCells.push(<th>Total</th>);
  return (
    <thead>
      <tr>{headerCells}</tr>
    </thead>
  );
}

export default TimelineHeader;
