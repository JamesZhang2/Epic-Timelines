import { useRef, useState, type ChangeEvent } from "react";
import type { BucketGranularity, ShowBucketHours, TimelineOptions } from "./EpicTimelines";
import "./OptionsCard.css";
import { dateAtLocalMidnight } from "./Util";

type OptionsCardProps = {
  timelineOptions: TimelineOptions;
  setTimelineOptions: React.Dispatch<React.SetStateAction<TimelineOptions>>;
};

/** Represents the card that contains the options. */
function OptionsCard({ timelineOptions, setTimelineOptions }: OptionsCardProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const granularityRef = useRef<HTMLSelectElement>(null);
  const showHoursRef = useRef<HTMLSelectElement>(null);
  const ignoreAllDayEventsRef = useRef<HTMLInputElement>(null);
  const useGlobalColorRef = useRef<HTMLInputElement>(null);
  const useGlobalScaleRef = useRef<HTMLInputElement>(null);
  const globalColorRef = useRef<HTMLInputElement>(null);
  const [useGlobalColorInput, setUseGlobalColorInput] = useState(timelineOptions.useGlobalColor);

  function handleUseGlobalColorChange(event: ChangeEvent<HTMLInputElement>) {
    setUseGlobalColorInput(event.currentTarget.checked);
  }

  function handleApplyOptions() {
    const startDate = dateAtLocalMidnight(startRef.current!.value);
    const endDate = dateAtLocalMidnight(endRef.current!.value);
    const bucketGranularity = granularityRef.current!.value as BucketGranularity;
    const showBucketHours = showHoursRef.current!.value as ShowBucketHours;
    const ignoreAllDayEvents = ignoreAllDayEventsRef.current!.checked;
    const useGlobalScale = useGlobalScaleRef.current!.checked;
    const useGlobalColor = useGlobalColorRef.current!.checked;
    const globalColor = globalColorRef.current!.value;

    if (startDate > endDate) {
      alert("Start date must be earlier than or equal to end date.");
      return;
    }

    const newOptions: TimelineOptions = {
      startDate,
      endDate,
      bucketGranularity,
      showBucketHours,
      ignoreAllDayEvents,
      useGlobalColor,
      useGlobalScale,
      globalColor,
    };
    setTimelineOptions(newOptions);
  }

  return (
    <div id="options-div" className="card">
      <p id="options-title" className="card-title">
        Options
      </p>
      <p>
        <label>
          Start Date:&nbsp;
          <input
            type="date"
            defaultValue={timelineOptions.startDate.toISOString().substring(0, 10)}
            ref={startRef}
          />
        </label>
      </p>
      <p>
        <label>
          End Date:&nbsp;
          <input
            type="date"
            defaultValue={timelineOptions.endDate.toISOString().substring(0, 10)}
            ref={endRef}
          />
        </label>
      </p>
      <p>
        Bucket granularity:&nbsp;
        <select defaultValue={timelineOptions.bucketGranularity} ref={granularityRef}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="3 months">3 Months</option>
          <option value="year">Year</option>
        </select>
      </p>
      <p>
        Show number of hours in each bucket?
        <select defaultValue={timelineOptions.showBucketHours} ref={showHoursRef}>
          <option value="all">Always</option>
          <option value="nonzero">Only nonzero entries</option>
          <option value="none">Never</option>
        </select>
      </p>
      <p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            defaultChecked={timelineOptions.ignoreAllDayEvents}
            ref={ignoreAllDayEventsRef}
          />
          Ignore all-day events (24 hours or longer)
        </label>
      </p>
      <p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useGlobalColorInput}
            ref={useGlobalColorRef}
            onChange={handleUseGlobalColorChange}
          />
          Use global color
        </label>
      </p>
      <p>
        <label>
          Global color:&nbsp;
          <input
            type="color"
            defaultValue={timelineOptions.globalColor}
            disabled={!useGlobalColorInput}
            ref={globalColorRef}
          />
        </label>
      </p>
      <p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            defaultChecked={timelineOptions.useGlobalScale}
            ref={useGlobalScaleRef}
          />
          Use global scale
        </label>
      </p>
      <div id="options-apply-button-container">
        <button id="options-apply-button" onClick={handleApplyOptions}>
          Apply
        </button>
      </div>
    </div>
  );
}

export default OptionsCard;
