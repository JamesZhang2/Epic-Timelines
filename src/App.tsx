import { useState } from 'react';
import './App.css';
import ICAL from "ical.js";


function App() {
  const [file, setFile] = useState<File | undefined>();

  const fileInput = document.getElementById("file-input");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const uploadedFile: File = fileList[0];
    setFile(fileList[0]);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parsed = parseICSToEvents(result);
      console.log(parsed);
    }

    reader.readAsText(uploadedFile);
  }

  function parseICSToEvents(s: string): ICAL.Event[] {
    const jcalData = ICAL.parse(s);

    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");
    const icalEvents = vevents.map((e) => new ICAL.Event(e));

    return icalEvents;
  }

  return <>
    <h1>Epic Timelines</h1>
    <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
  </>;
}

export default App
