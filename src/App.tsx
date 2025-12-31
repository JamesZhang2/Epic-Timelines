import { useState } from "react";
import "./App.css";
import EpicTimelines from "./EpicTimelines";
import type { CalendarEvent } from "./Util";
import { parseICSToCalendarEvents } from "./Util";

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
      const events = parseICSToCalendarEvents(result);
      console.log(events);
      setEvents(events);
      setFileUploaded(true);
    }

    reader.readAsText(uploadedFile);
  }

  if (fileUploaded) {
    return <>
      <h1>Epic Timelines</h1>
      <p id="upload-instructions">Export the .ics file from your calendar and upload it here:</p>
      <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
      <p id="upload-success-text">Calendar file successfully uploaded!</p>
      <EpicTimelines events={events}></EpicTimelines>
    </>;
  } else {
    return <>
      <h1>Epic Timelines</h1>
      <p id="upload-instructions">Export the .ics file from your calendar and upload it here:</p>
      <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
    </>
  }
}

export default App
