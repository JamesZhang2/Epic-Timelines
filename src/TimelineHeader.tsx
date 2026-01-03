import type { TimeBucket } from "./EpicTimelines";
import "./TimelineHeader.css";

type TimelineHeaderProps = {
  timeBuckets: TimeBucket[];
}

function TimelineHeader({ timeBuckets }: TimelineHeaderProps) {
  return (<thead>
    <tr>
      <th>Epics</th>
      {timeBuckets.map((bucket) => <th key={bucket.start.toISOString()}>{(bucket.start.getMonth() + 1) + "/" + bucket.start.getDate()}</th>)}
    </tr>
  </thead>);
}

export default TimelineHeader;