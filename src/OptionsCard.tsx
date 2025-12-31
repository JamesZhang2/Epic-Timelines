import type { TimelineOptions } from "./EpicTimelines";
import "./OptionsCard.css";

type OptionsCardProps = {
  timelineOptions: TimelineOptions;
  setTimelineOptions: React.Dispatch<React.SetStateAction<TimelineOptions>>;
}

/** Represents the card that contains the options. */
function OptionsCard({ timelineOptions, setTimelineOptions }: OptionsCardProps) {
  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = new Date(e.target.value);
    console.log(newStart);
    if (newStart > timelineOptions.endDate) {
      alert("Start date must be before or equal to end date.");
      return;
    }
    setTimelineOptions(prev => ({ ...prev, startDate: newStart }));
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = new Date(e.target.value);
    console.log(newEnd);
    if (newEnd < timelineOptions.startDate) {
      alert("End date must be after or equal to start date.");
      return;
    }
    setTimelineOptions(prev => ({ ...prev, endDate: newEnd }));
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
    </div>
  );
}

export default OptionsCard;