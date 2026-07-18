import type { ChangeEvent } from "react";
import "./UploadCard.css";

type UploadCardProps = {
  fileUploaded: boolean;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

/** Represents the card for uploading an exported calendar file. */
function UploadCard({ fileUploaded, onFileUpload }: UploadCardProps) {
  return (
    <div id="upload-card" className="card">
      <p id="upload-title" className="card-title">
        Upload Calendar
      </p>
      <p id="upload-instructions">
        Export the .ics file from your calendar and upload it here to get started.
      </p>
      <label id="file-input-label" htmlFor="file-input">
        Calendar file
      </label>
      <input type="file" id="file-input" accept=".ics" onChange={onFileUpload} />
      {fileUploaded && <p id="upload-success-text">Calendar file successfully uploaded!</p>}
    </div>
  );
}

export default UploadCard;
