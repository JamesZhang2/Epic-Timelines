import { useRef } from "react";
import type { Epic } from "./EpicTimelines";
import "./AddEpicCard.css";

type AddEpicCardProps = {
  // Returns true if epic is successfully added, false otherwise
  onAddEpic: (newEpic: Epic) => boolean;
}

/**
 * Represents the card to add a new Epic.
 */
function AddEpicCard({ onAddEpic }: AddEpicCardProps) {
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const caseSensitiveRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  function handleAddEpicButtonClick() {
    const newName = epicNameInputRef.current?.value.trim();
    const newKeyword = keywordInputRef.current?.value.trim();
    const caseSensitive = caseSensitiveRef.current?.checked ?? false;
    const color = colorRef.current?.value || "#7799ff";

    if (!newName) {
      alert("Error: Please give this Epic a name.");
      return;
    }
    if (!newKeyword) {
      alert("Error: Please provide the keyword to match for in this Epic.")
      return;
    }

    const newEpic: Epic = {
      name: newName,
      keyword: newKeyword,
      caseSensitive: caseSensitive,
      color: color,
      // TODO
      matchTitle: true,
      matchDescription: true,
      matchLocation: false
    };

    const success = onAddEpic(newEpic);
    if (success) {
      // Clear input
      epicNameInputRef.current!.value = "";
      keywordInputRef.current!.value = "";
      caseSensitiveRef.current!.checked = false;
    }
  }

  return <div id="add-epic-div" className="card">
    <p id="add-epic-title" className="card-title">Add a new Epic</p>
    <p id="add-epic-name">
      <label>Name: </label>
      <input type="text" ref={epicNameInputRef} />
    </p>
    <p id="add-epic-keyword">
      <label>Keyword:</label>
      <input type="text" ref={keywordInputRef} />
    </p>
    <p>
      <label id="add-epic-case-sensitive-checkbox">
        Case sensitive:
        <input type="checkbox" ref={caseSensitiveRef} />
      </label>
    </p>
    <p>
      <label id="add-epic-color-picker">
        Color: <input ref={colorRef} type="color" defaultValue="#7799ff" />
      </label>
    </p>
    <div id="add-epic-button-container">
      <button id="add-epic-button" onClick={handleAddEpicButtonClick}>Add</button>
    </div>
  </div>;
}

export default AddEpicCard;