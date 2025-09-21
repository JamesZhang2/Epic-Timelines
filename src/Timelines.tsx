import type { CalendarEvent } from './App';

type TimelinesProps = {
    events: CalendarEvent[];
}

type TimeBucket = {
    start: Date;
    end: Date;
}

function Timelines({ events }: TimelinesProps) {
    const startDate = new Date("2025-09-22T00:00:00Z");
    const endDate = new Date("2025-09-28T00:00:00Z");
    const timeBuckets: TimeBucket[] = [];
    let curDate = startDate;
    while (curDate <= endDate) {
        timeBuckets.push({
            start: new Date(curDate),
            end: new Date(curDate.getDate() + 1)
        })
        curDate.setDate(curDate.getDate() + 1);
    }
    console.log(timeBuckets);

    return <pre>Events: {JSON.stringify(events, null, 2)}</pre>
}

export default Timelines;