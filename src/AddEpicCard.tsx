import { useRef, useState, type ChangeEvent } from "react";
import type { Epic } from "./Timelines.types";
import "./AddEpicCard.css";

type AddEpicCardProps = {
  // Returns true if epic is successfully added, false otherwise
  onAddEpic: (newEpic: Epic) => boolean;
};

/**
 * Represents the card to add a new Epic.
 */
function AddEpicCard({ onAddEpic }: AddEpicCardProps) {
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const caseSensitiveRef = useRef<HTMLInputElement>(null);
  const matchTitleRef = useRef<HTMLInputElement>(null);
  const matchDescriptionRef = useRef<HTMLInputElement>(null);
  const matchLocationRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const [sameAsName, setSameAsName] = useState(false);

  function syncKeywordWithName() {
    if (keywordInputRef.current && epicNameInputRef.current) {
      keywordInputRef.current.value = epicNameInputRef.current.value;
    }
  }

  function handleNameChange() {
    if (sameAsName) {
      syncKeywordWithName();
    }
  }

  function handleSameAsNameChange(event: ChangeEvent<HTMLInputElement>) {
    setSameAsName(event.currentTarget.checked);
    if (event.currentTarget.checked) {
      syncKeywordWithName();
    }
  }

  function handleAddEpicButtonClick() {
    const newName = epicNameInputRef.current?.value.trim();
    const newKeyword = keywordInputRef.current?.value.trim();
    const caseSensitive = caseSensitiveRef.current?.checked ?? false;
    const matchTitle = matchTitleRef.current?.checked ?? false;
    const matchDescription = matchDescriptionRef.current?.checked ?? false;
    const matchLocation = matchLocationRef.current?.checked ?? false;
    const color = colorRef.current?.value || "#2f80ed";

    if (!newName) {
      alert("Error: Please give this Epic a name.");
      return;
    }
    if (!newKeyword) {
      alert("Error: Please provide the keyword to match for in this Epic.");
      return;
    }
    if (!(matchTitle || matchDescription || matchLocation)) {
      alert("Error: At least one of the fields must be included in the match.");
      return;
    }

    const newEpic: Epic = {
      name: newName,
      keyword: newKeyword,
      caseSensitive: caseSensitive,
      color: color,
      matchTitle: matchTitle,
      matchDescription: matchDescription,
      matchLocation: matchLocation,
    };

    const success = onAddEpic(newEpic);
    if (success) {
      // Clear input
      epicNameInputRef.current!.value = "";
      keywordInputRef.current!.value = "";
      // Leave checkboxes unchanged - user may want to input several Epics with the same settings
    }
  }

  return (
    <div id="add-epic-div" className="card">
      <p id="add-epic-title" className="card-title">
        Add a new Epic
      </p>
      <p id="add-epic-name">
        <label>Name: </label>
        <input
          className="add-epic-text-input"
          type="text"
          ref={epicNameInputRef}
          onChange={handleNameChange}
        />
      </p>
      <p id="add-epic-keyword">
        <label>Keyword:</label>
        <input
          className="add-epic-text-input"
          type="text"
          ref={keywordInputRef}
          disabled={sameAsName}
        />
        <label id="add-epic-same-as-name" className="checkbox-label">
          <input type="checkbox" checked={sameAsName} onChange={handleSameAsNameChange} />
          Same as Name
        </label>
      </p>
      <p>
        <label id="add-epic-case-sensitive-checkbox" className="checkbox-label">
          <input type="checkbox" ref={caseSensitiveRef} />
          Case sensitive
        </label>
      </p>
      <p className="checkbox-row">
        <span>Match:&nbsp;</span>
        <label id="add-epic-match-title" className="checkbox-label">
          <input type="checkbox" ref={matchTitleRef} defaultChecked />
          Title
        </label>
        <label id="add-epic-match-description" className="checkbox-label">
          <input type="checkbox" ref={matchDescriptionRef} defaultChecked />
          Description
        </label>
        <label id="add-epic-match-location" className="checkbox-label">
          <input type="checkbox" ref={matchLocationRef} />
          Location
        </label>
      </p>
      <p>
        <label id="add-epic-color-picker">
          Color: <input ref={colorRef} type="color" defaultValue="#2f80ed" />
        </label>
      </p>
      <div id="add-epic-button-container">
        <button id="add-epic-button" onClick={handleAddEpicButtonClick}>
          Add
        </button>
      </div>
    </div>
  );
}

export default AddEpicCard;
