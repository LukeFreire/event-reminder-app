import type { Event } from "../types/Event";
import { formatTime } from "../lib/formatTime";

interface EventCardProps {
  event: Event;
  onEditEvent: (eventId: string) => void;
  onGoLive: (eventId: string) => void;
}

function EventCard({ event, onEditEvent, onGoLive }: EventCardProps) {
  return (
    <div className="event-card">
      <div className="event-card-top">
        <h3>{event.title}</h3>

        <div className="event-card-actions">
          <button
            className="primary-button go-live-button"
            onClick={() => onGoLive(event.id)}
          >
            Go Live
          </button>
          <button
            className="secondary-button edit-event-button"
            onClick={() => onEditEvent(event.id)}
          >
            Edit
          </button>
        </div>
      </div>

      <p>
        <strong>Date:</strong> {event.date}
      </p>

      <p>
        <strong>Call Time:</strong> {formatTime(event.callTime)}
      </p>

      <p>
        <strong>Time:</strong> {formatTime(event.startTime)}
        {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
      </p>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      <div className="reminders-section">
        <strong>Reminders</strong>

        {event.reminders.length === 0 ? (
          <p className="reminders-empty">No reminders yet.</p>
        ) : (
          <ul className="reminders-list">
            {event.reminders.map((reminder) => (
              <li key={reminder.id} className="reminder-item">
                <div>
                  <p className="reminder-title">
                    {reminder.title}
                    {reminder.teamName && (
                      <span className="team-badge">{reminder.teamName}</span>
                    )}
                  </p>
                  <p className="reminder-meta">
                    {formatTime(reminder.triggerTime)} · {reminder.message}
                  </p>
                </div>

                <span className={`status-badge status-${reminder.status}`}>
                  {reminder.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EventCard;
