import { useState, type ChangeEvent } from "react";
import "./App.css";
import EpicTimelines from "./EpicTimelines";
import UploadCard from "./UploadCard";

function App() {
  const [icsText, setIcsText] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const uploadedFile: File = fileList[0];
    const reader = new FileReader();
    const loadStartedAt = performance.now();

    reader.onload = () => {
      const result = reader.result as string;
      const loadDelayMs = performance.now() - loadStartedAt;

      console.info(`File loaded in ${loadDelayMs.toFixed(1)}ms.`);
      setIcsText(result);
      setFileUploaded(true);
    };

    reader.readAsText(uploadedFile);
  }

  return (
    <>
      <h1>Epic Timelines</h1>
      <UploadCard fileUploaded={fileUploaded} onFileUpload={handleFileUpload} />
      {fileUploaded && <EpicTimelines icsText={icsText}></EpicTimelines>}
    </>
  );
}

export default App;
