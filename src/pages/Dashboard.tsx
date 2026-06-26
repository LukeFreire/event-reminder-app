import { useState } from "react";
import EventCard from "../components/EventCard";
import type { Event } from "../types/Event";
import CreateEventForm from "../components/CreateEventForm";

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Sunday Service",
    description: "Main Sunday morning service",
    date: "2026-06-28",
    startTime: "09:00",
    endTime: "10:30",
    location: "Main Sanctuary",
    createdBy: "demo-user",
    reminders: [],
  },
];

function Dashboard() {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [showCreateForm, setShowCreateForm] = useState(false);


function handleAddEvent(event: Event) {
  setEvents([...events, event]);
  setShowCreateForm(false);
}

return (
  <div className="app-container">
    <header className="header">
      <h1>Live Event Production</h1>
      <p>Build timelines. Trigger reminders. Keep teams on track.</p>
    </header>

    <main className="dashboard">
      <div className="dashboard-top">
        <h2>Scheduled Events</h2>
      </div>

      <div className="event-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {showCreateForm ? (
        <CreateEventForm
        onCreateEvent={handleAddEvent}
        onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <button
          className="primary-button create-event-button"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Event
        </button>
      )}
    </main>
  </div>
);
}

export default Dashboard;