import { useState, useRef, useEffect } from "react";
import type { Epic } from "./EpicTimelines";
import "./EpicDetails.css";

type EpicDetailsProps = {
  epic: Epic;
  numCols: number;
  onDeleteEpic: (epicName: string) => void;
  onEditEpic: (oldEpicName: string, newEpic: Epic) => boolean;
}

/**
 * Represents the detailed information about an Epic.
 * It's displayed right below the selected Epic, so it's also a row in the Timelines table.
 */
function EpicDetails({ epic, numCols, onDeleteEpic, onEditEpic }: EpicDetailsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [editingEpic, setEditingEpic] = useState<boolean>(false);
  const epicNameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const caseSensitiveRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  function handleDeleteEpicButtonClick(epicName: string) {
    if (confirmingDelete) {
      // User pressed again, delete Epic
      onDeleteEpic(epicName);
    } else {
      setConfirmingDelete(true);
    }
  }

  function handleEditEpicButtonClick(oldEpicName: string) {
    if (editingEpic) {
      const updatedName = epicNameInputRef.current?.value.trim();
      const updatedKeyword = keywordInputRef.current?.value.trim();
      const updatedCaseSensitive = caseSensitiveRef.current?.checked ?? false;
      const updatedColor = colorRef.current?.value || "#7799ff";

      if (!updatedName) {
        alert("Error: The updated Epic must have a name.");
        return;
      }
      if (!updatedKeyword) {
        alert("Error: The updated Epic must have a keyword to match for.")
        return;
      }

      const updatedEpic: Epic = {
        name: updatedName,
        keyword: updatedKeyword,
        caseSensitive: updatedCaseSensitive,
        color: updatedColor
      }

      onEditEpic(oldEpicName, updatedEpic);
      setEditingEpic(false);
    } else {
      setEditingEpic(true);
    }
  }

  useEffect(() => {
    if (!confirmingDelete) {
      return;
    }
    const timer = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  return <tr className="epic-details">
    <td colSpan={numCols + 1}>
      {editingEpic ?
        <>
          <p>
            <strong>Name:</strong> <input type="text" defaultValue={epic.name} ref={epicNameInputRef} />
          </p>
          <p>
            <strong>Keyword:</strong> <input type="text" defaultValue={epic.keyword} ref={keywordInputRef} />
          </p>
          <p>
            <strong>Case sensitive:</strong> <input type="checkbox" defaultChecked={epic.caseSensitive} ref={caseSensitiveRef} />
          </p>
          <p>
            <strong>Color: </strong> <input type="color" defaultValue={epic.color} ref={colorRef} />
          </p>
        </> :
        <>
          <p><strong>Name:</strong> {epic.name}</p>
          <p><strong>Keyword:</strong> {epic.keyword}</p>
          <p><strong>Case sensitive:</strong> {epic.caseSensitive ? "Yes" : "No"}</p>
        </>}
      <div id="epic-details-button-container">
        <button id="edit-epic-button" onClick={() => handleEditEpicButtonClick(epic.name)}>
          {editingEpic ? "Confirm" : "Edit Epic"}
        </button>
        <button id="delete-epic-button" onClick={() => handleDeleteEpicButtonClick(epic.name)}>
          {confirmingDelete ? "Are you sure?" : "Delete Epic"}
        </button>
      </div>
    </td>
  </tr>;
}

export default EpicDetails;