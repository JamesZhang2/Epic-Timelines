import { useState } from 'react';
import './App.css';
import Timelines from './Timelines';
import ICAL from "ical.js";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}

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

  function parseICSToCalendarEvents(s: string): CalendarEvent[] {
    const jcalData = ICAL.parse(s);

    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");
    const icalEvents = vevents.map((e) => new ICAL.Event(e));

    const events = icalEvents.map(parseVEventToCalendarEvent);
    return events;
  }

  function parseVEventToCalendarEvent(event: ICAL.Event): CalendarEvent {
    // TODO: Deal with repeating events
    return {
      id: event.uid,
      title: event.summary,
      description: event.description,
      location: event.location,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate()
    }
  }

  return <>
    <h1>Epic Timelines</h1>
    <input type="file" id="file-input" accept=".ics" onChange={handleFileUpload} />
    <Timelines events={events}></Timelines>
  </>;
}

export default App
