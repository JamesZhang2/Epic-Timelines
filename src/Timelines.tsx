import type { CalendarEvent } from './App';

type TimelinesProps = {
    events: CalendarEvent[],
}

function Timelines({ events }: TimelinesProps) {
    return <pre>Events: {JSON.stringify(events, null, 2)}</pre>
}

export default Timelines;