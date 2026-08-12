import type { Event } from "../types/Event";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>

      <p>
        <strong>Date:</strong> {event.date}
      </p>

      <p>
        <strong>Call Time:</strong> {event.callTime}
      </p>

      <p>
        <strong>Time:</strong> {event.startTime} - {event.endTime}
      </p>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      <p>
        <strong>Reminders:</strong> {event.reminders.length}
      </p>
    </div>
  );
}

export default EventCard;