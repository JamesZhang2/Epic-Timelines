import type { BucketGranularity, TimelineOptions } from "./EpicTimelines";
import "./OptionsCard.css";
import { dateAtLocalMidnight } from "./Util";

type OptionsCardProps = {
  timelineOptions: TimelineOptions;
  setTimelineOptions: React.Dispatch<React.SetStateAction<TimelineOptions>>;
}

/** Represents the card that contains the options. */
function OptionsCard({ timelineOptions, setTimelineOptions }: OptionsCardProps) {
  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = dateAtLocalMidnight(e.target.value);
    console.log(newStart);
    if (newStart > timelineOptions.endDate) {
      alert("Start date must be earlier than or equal to end date.");
      return;
    }
    setTimelineOptions(prev => ({ ...prev, startDate: newStart }));
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = dateAtLocalMidnight(e.target.value);
    console.log(newEnd);
    if (newEnd < timelineOptions.startDate) {
      alert("End date must be later than or equal to start date.");
      return;
    }
    setTimelineOptions(prev => ({ ...prev, endDate: newEnd }));
  }

  function handleBucketGranularityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const bucketGranularity: BucketGranularity = e.target.value as BucketGranularity;
    setTimelineOptions(prev => ({ ...prev, bucketGranularity: bucketGranularity }));
  }

  return (
    <div id="options-div" className="card">
      <p id="options-title" className="card-title">Options</p>
      <p>
        <label>
          Start Date:
          <input
            type="date"
            value={timelineOptions.startDate.toISOString().substring(0, 10)}
            onChange={handleStartChange}
          />
        </label>
      </p>
      <p>
        <label>
          End Date:
          <input
            type="date"
            value={timelineOptions.endDate.toISOString().substring(0, 10)}
            onChange={handleEndChange}
          />
        </label>
      </p>
      <p>
        Bucket granularity:
        <select
          value={timelineOptions.bucketGranularity}
          onChange={handleBucketGranularityChange}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="3 months">3 Months</option>
          <option value="year">Year</option>
        </select>
      </p>
      <div id="options-apply-button-container">
        <button id="options-apply-button">Apply</button>
      </div>
    </div>
  );
}

export default OptionsCard;