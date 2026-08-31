import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Event } from "../types/Event";
import type { ReminderStatus } from "../types/Reminder";
import { formatTime } from "../lib/formatTime";
import EventChat from "../components/EventChat";

interface LiveEventPageProps {
  event: Event;
  session: Session;
  onExit: () => void;
  onUpdateReminderStatus: (
    eventId: string,
    reminderId: string,
    status: ReminderStatus
  ) => void;
}

// How long a reminder can sit un-acknowledged past its trigger time before
// it's automatically marked missed (the outline's "auto-clicks red" rule).
const MISSED_GRACE_MINUTES = 5;

function getTriggerDateTime(event: Event, triggerTime: string): Date {
  return new Date(`${event.date}T${triggerTime}:00`);
}

function LiveEventPage({
  event,
  session,
  onExit,
  onUpdateReminderStatus,
}: LiveEventPageProps) {
  const [now, setNow] = useState(new Date());
  const autoMissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    for (const reminder of event.reminders) {
      if (reminder.status !== "pending") continue;
      if (autoMissedRef.current.has(reminder.id)) continue;

      const dueAt = getTriggerDateTime(event, reminder.triggerTime);
      const graceDeadline = new Date(dueAt.getTime() + MISSED_GRACE_MINUTES * 60_000);

      if (now >= graceDeadline) {
        autoMissedRef.current.add(reminder.id);
        onUpdateReminderStatus(event.id, reminder.id, "missed");
      }
    }
  }, [now, event, onUpdateReminderStatus]);

  const dueReminders = event.reminders
    .filter(
      (reminder) =>
        reminder.status === "pending" &&
        getTriggerDateTime(event, reminder.triggerTime) <= now
    )
    .sort((a, b) => a.triggerTime.localeCompare(b.triggerTime));

  const activeReminder = dueReminders[0] ?? null;

  const sortedReminders = [...event.reminders].sort((a, b) =>
    a.triggerTime.localeCompare(b.triggerTime)
  );

  return (
    <div className="live-event-page">
      <div className="dashboard-top">
        <div>
          <h2>{event.title} · Live</h2>
          <p className="live-clock">{now.toLocaleTimeString()}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onExit}>
          Exit Live View
        </button>
      </div>

      {sortedReminders.length === 0 ? (
        <p className="reminders-empty">
          This event has no reminders yet — add some from the Edit page.
        </p>
      ) : (
        <ol className="reminders-list numbered">
          {sortedReminders.map((reminder) => (
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
        </ol>
      )}

      <EventChat eventId={event.id} session={session} />

      {activeReminder && (
        <div className="reminder-popup-overlay">
          <div className="reminder-popup">
            <p className="reminder-popup-label">
              {activeReminder.teamName ?? "Reminder"}
            </p>
            <h2>{activeReminder.title}</h2>
            <p className="reminder-popup-message">{activeReminder.message}</p>
            <p className="reminder-popup-detail">
              {event.title} · {event.location}
            </p>

            <div className="reminder-popup-actions">
              <button
                className="popup-check popup-check-yellow"
                onClick={() =>
                  onUpdateReminderStatus(
                    event.id,
                    activeReminder.id,
                    "acknowledged"
                  )
                }
              >
                Seen / Heard
              </button>
              <button
                className="popup-check popup-check-green"
                onClick={() =>
                  onUpdateReminderStatus(
                    event.id,
                    activeReminder.id,
                    "completed"
                  )
                }
              >
                Task Fulfilled
              </button>
              <button
                className="popup-check popup-check-red"
                onClick={() =>
                  onUpdateReminderStatus(event.id, activeReminder.id, "missed")
                }
              >
                Missed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveEventPage;
