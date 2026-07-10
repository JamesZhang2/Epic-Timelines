import "./SaveLoadCard.css";

type SaveLoadCardProps = {
  onSave: () => void;
};

function SaveLoadCard({ onSave }: SaveLoadCardProps) {
  return (
    <div id="save-load-div" className="card">
      <p id="save-load-title" className="card-title">
        Save / Load
      </p>
      <p id="save-load-description">
        Saves only Epics and Options. Calendar events and the uploaded .ics file are not included.
      </p>
      <div id="save-load-button-container">
        <button id="save-config-button" type="button" onClick={onSave}>
          Save
        </button>
        <button id="load-config-button" type="button">
          Load
        </button>
      </div>
    </div>
  );
}

export default SaveLoadCard;
