import { useRef } from "react";
import type { BucketGranularity, TimelineOptions } from "./EpicTimelines";
import "./OptionsCard.css";
import { dateAtLocalMidnight } from "./Util";

type OptionsCardProps = {
  timelineOptions: TimelineOptions;
  setTimelineOptions: React.Dispatch<React.SetStateAction<TimelineOptions>>;
}

/** Represents the card that contains the options. */
function OptionsCard({ timelineOptions, setTimelineOptions }: OptionsCardProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const bucketRef = useRef<HTMLSelectElement>(null);

  function handleApplyOptions() {
    const startDate = dateAtLocalMidnight(startRef.current!.value);
    const endDate = dateAtLocalMidnight(endRef.current!.value);
    const bucketGranularity = bucketRef.current!.value as BucketGranularity;

    if (startDate > endDate) {
      alert("Start date must be earlier than or equal to end date.");
      return;
    }

    const newOptions: TimelineOptions = { startDate, endDate, bucketGranularity };
    setTimelineOptions(newOptions);
  }

  return (
    <div id="options-div" className="card">
      <p id="options-title" className="card-title">Options</p>
      <p>
        <label>
          Start Date:
          <input
            type="date"
            defaultValue={timelineOptions.startDate.toISOString().substring(0, 10)}
            ref={startRef}
          />
        </label>
      </p>
      <p>
        <label>
          End Date:
          <input
            type="date"
            defaultValue={timelineOptions.endDate.toISOString().substring(0, 10)}
            ref={endRef}
          />
        </label>
      </p>
      <p>
        Bucket granularity:
        <select defaultValue={timelineOptions.bucketGranularity} ref={bucketRef}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="3 months">3 Months</option>
          <option value="year">Year</option>
        </select>
      </p>
      <div id="options-apply-button-container">
        <button id="options-apply-button" onClick={handleApplyOptions}>Apply</button>
      </div>
    </div>
  );
}

export default OptionsCard;