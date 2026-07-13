import { useRef, type ChangeEvent } from "react";
import "./SaveLoadCard.css";

type SaveLoadCardProps = {
  onSave: () => void;
  onLoad: (jsonText: string) => void;
};

function SaveLoadCard({ onSave, onLoad }: SaveLoadCardProps) {
  const loadInputRef = useRef<HTMLInputElement>(null);

  function handleLoadClick() {
    loadInputRef.current?.click();
  }

  function handleLoadFile(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const uploadedFile = fileList[0];
    const reader = new FileReader();

    reader.onload = () => {
      onLoad(reader.result as string);
    };

    reader.readAsText(uploadedFile);
    event.target.value = "";
  }

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
        <button id="load-config-button" type="button" onClick={handleLoadClick}>
          Load
        </button>
        <input
          ref={loadInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleLoadFile}
        />
      </div>
    </div>
  );
}

export default SaveLoadCard;
