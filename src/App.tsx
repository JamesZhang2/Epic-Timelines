import { useState } from "react";
import "./App.css";
import EpicTimelines from "./EpicTimelines";

function App() {
  const [icsText, setIcsText] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const uploadedFile: File = fileList[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setIcsText(result);
      setFileUploaded(true);
    };

    reader.readAsText(uploadedFile);
  }

  if (fileUploaded) {
    return (
      <>
        <h1>Epic Timelines</h1>
        <p id="upload-instructions">Export the .ics file from your calendar and upload it here:</p>
        <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
        <p id="upload-success-text">Calendar file successfully uploaded!</p>
        <EpicTimelines icsText={icsText}></EpicTimelines>
      </>
    );
  } else {
    return (
      <>
        <h1>Epic Timelines</h1>
        <p id="upload-instructions">Export the .ics file from your calendar and upload it here:</p>
        <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
      </>
    );
  }
}

export default App;
