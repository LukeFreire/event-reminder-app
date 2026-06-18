import type { Event } from "../types/Event";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>Date: {event.date}</p>
      <p>Reminders: {event.reminders}</p>
    </div>
  );
}

export default EventCard;