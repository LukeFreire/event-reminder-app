import { useState } from "react";
import EventCard from "../components/EventCard";
import type { Event } from "../types/Event";

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Sunday Service",
    date: "2026-06-22",
    reminders: 12,
  },
  {
    id: "2",
    title: "Youth Night",
    date: "2026-06-25",
    reminders: 8,
  },
  {
    id: "3",
    title: "Conference 2026",
    date: "2026-07-10",
    reminders: 24,
  },
];

function Dashboard() {
    const [events, setEvents] = useState<Event[]>(initialEvents);

function handleCreateEvent() {
  const newEvent: Event = {
    id: Date.now().toString(),
    title: "New Event",
    date: "2026-07-01",
    reminders: 0,
  };

  setEvents([...events, newEvent]);
}
  return (
    <div>
      <h1>Event Reminder App</h1>

      <button onClick={handleCreateEvent}>Create Event</button>

      <h2>Upcoming Events</h2>

    <div>
        {events.map((event) => (
        <EventCard key={event.id} event={event} />
     ))}
</div>
    </div>
  );
}

export default Dashboard;