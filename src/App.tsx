import { useState } from "react";
import "./App.css";
import Timelines from "./Timelines";
import type { CalendarEvent } from "./Util";
import { parseICSToCalendarEvents } from "./Util";

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

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
    }

    reader.readAsText(uploadedFile);
  }


  return <>
    <h1>Epic Timelines</h1>
    <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
    <Timelines events={events}></Timelines>
  </>;
}

export default App
