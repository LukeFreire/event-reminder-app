import { useEffect, useState } from "react";
import type { Event } from "../types/Event";
import { formatTime } from "../lib/formatTime";
import { isVisibleToViewer } from "../lib/reminderVisibility";
import { combineDateAndTime } from "../lib/dateTime";

interface EventCardProps {
  event: Event;
  isAdmin: boolean;
  myTeamIds: string[];
  onEditEvent: (eventId: string) => void;
  onGoLive: (eventId: string) => void;
}

function EventCard({
  event,
  isAdmin,
  myTeamIds,
  onEditEvent,
  onGoLive,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(new Date());

  // Participants can't start a live session themselves, so this only
  // needs to notice when the scheduled start time arrives -- a coarse
  // tick is plenty (unlike the reminder popup clock, this isn't gating
  // second-by-second acknowledgement).
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const visibleReminders = event.reminders.filter(
    (reminder) => isAdmin || isVisibleToViewer(reminder, myTeamIds)
  );

  const hasStartTimeArrived =
    combineDateAndTime(event.date, event.startTime) <= now;
  const canJoinLive =
    isAdmin || event.liveStartedAt !== null || hasStartTimeArrived;

  return (
    <div className="event-card">
      <div className="event-card-top">
        <div className="event-card-heading">
          <h3>{event.title}</h3>
          <p className="event-card-summary">
            {event.date} · {formatTime(event.startTime)} ·{" "}
            {visibleReminders.length}{" "}
            {visibleReminders.length === 1 ? "reminder" : "reminders"}
          </p>
        </div>

        <div className="event-card-actions">
          <button
            className="primary-button go-live-button"
            onClick={() => onGoLive(event.id)}
            disabled={!canJoinLive}
            title={
              canJoinLive
                ? undefined
                : "The admin hasn't started this event yet"
            }
          >
            {isAdmin ? "Go Live" : "Join"}
          </button>
          {isAdmin && (
            <button
              className="secondary-button edit-event-button"
              onClick={() => onEditEvent(event.id)}
            >
              Edit
            </button>
          )}
          <button
            className="secondary-button expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="event-card-details">
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
            ) : visibleReminders.length === 0 ? (
              <p className="reminders-empty">
                No reminders assigned to your team yet.
              </p>
            ) : (
              <ul className="reminders-list">
                {visibleReminders.map((reminder) => (
                  <li key={reminder.id} className="reminder-item">
                    <div>
                      <p className="reminder-title">
                        {reminder.title}
                        {reminder.teamName && (
                          <span className="team-badge">
                            {reminder.teamName}
                          </span>
                        )}
                      </p>
                      <p className="reminder-meta">
                        {formatTime(reminder.triggerTime)}
                        {reminder.message ? ` · ${reminder.message}` : ""}
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
      )}
    </div>
  );
}

export default EventCard;
