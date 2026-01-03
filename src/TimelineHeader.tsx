import type { TimeBucket } from "./EpicTimelines";
import "./TimelineHeader.css";

type TimelineHeaderProps = {
  timeBuckets: TimeBucket[];
}

function TimelineHeader({ timeBuckets }: TimelineHeaderProps) {
  const headerCells = [];
  headerCells.push(<th>Epics</th>);
  for (let i = 0; i < timeBuckets.length; i++) {
    if (i > 0 && timeBuckets[i].start.getFullYear() === timeBuckets[i - 1].start.getFullYear()) {
      headerCells.push(<th key={timeBuckets[i].start.toISOString()}>{(timeBuckets[i].start.getMonth() + 1) + "/" + timeBuckets[i].start.getDate()}</th>);
    } else {
      headerCells.push(<th key={timeBuckets[i].start.toISOString()}>{(timeBuckets[i].start.getMonth() + 1) + "/" + timeBuckets[i].start.getDate() + "/" + timeBuckets[i].start.getFullYear() % 100}</th>);
    }
  }
  headerCells.push(<th>Total</th>);
  return (<thead>
    <tr>
      {headerCells}
    </tr>
  </thead>);
}

export default TimelineHeader;