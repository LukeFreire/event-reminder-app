import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Event } from "../types/Event";
import type { Reminder, ReminderStatus } from "../types/Reminder";
import { REMINDER_STATUSES } from "../types/Reminder";
import type { Team } from "../types/Team";
import { formatTime } from "../lib/formatTime";
import { isVisibleToViewer } from "../lib/reminderVisibility";
import { combineDateAndTime } from "../lib/dateTime";
import EventChat from "../components/EventChat";
import ReminderForm from "../components/ReminderForm";

interface LiveEventPageProps {
  event: Event;
  session: Session;
  isAdmin: boolean;
  myTeamIds: string[];
  teams: Team[];
  onExit: () => void;
  onAddReminder: (
    eventId: string,
    reminder: Omit<Reminder, "id" | "eventId" | "teamName">
  ) => void;
  onCreateTeam: (name: string) => Promise<Team>;
  onUpdateReminderStatus: (
    eventId: string,
    reminderId: string,
    status: ReminderStatus
  ) => void;
}

// How long a reminder can sit un-acknowledged past its trigger time before
// it's automatically marked missed (the outline's "auto-clicks red" rule).
const MISSED_GRACE_MINUTES = 5;

function LiveEventPage({
  event,
  session,
  isAdmin,
  myTeamIds,
  teams,
  onExit,
  onAddReminder,
  onCreateTeam,
  onUpdateReminderStatus,
}: LiveEventPageProps) {
  const [now, setNow] = useState(new Date());
  const [showReminderForm, setShowReminderForm] = useState(false);
  const autoMissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    for (const reminder of event.reminders) {
      if (reminder.status !== "pending") continue;
      if (autoMissedRef.current.has(reminder.id)) continue;

      const dueAt = combineDateAndTime(event.date, reminder.triggerTime);
      const graceDeadline = new Date(dueAt.getTime() + MISSED_GRACE_MINUTES * 60_000);

      if (now >= graceDeadline) {
        autoMissedRef.current.add(reminder.id);
        onUpdateReminderStatus(event.id, reminder.id, "missed");
      }
    }
  }, [now, event, onUpdateReminderStatus]);

  // Admins run the show from the dashboard rather than executing tasks
  // themselves, so they never get interrupted by a popup -- but they can
  // still see and edit every reminder in the list below.
  const dueReminders = event.reminders
    .filter(
      (reminder) =>
        !isAdmin &&
        reminder.status === "pending" &&
        combineDateAndTime(event.date, reminder.triggerTime) <= now &&
        isVisibleToViewer(reminder, myTeamIds)
    )
    .sort((a, b) => a.triggerTime.localeCompare(b.triggerTime));

  const activeReminder = dueReminders[0] ?? null;

  const sortedReminders = event.reminders
    .filter((reminder) => isAdmin || isVisibleToViewer(reminder, myTeamIds))
    .sort((a, b) => a.triggerTime.localeCompare(b.triggerTime));

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

      {event.reminders.length === 0 ? (
        <p className="reminders-empty">
          This event has no reminders yet — add some from the Edit page.
        </p>
      ) : sortedReminders.length === 0 ? (
        <p className="reminders-empty">
          No reminders assigned to your team for this event yet.
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
                  {formatTime(reminder.triggerTime)}
                  {reminder.message ? ` · ${reminder.message}` : ""}
                </p>
              </div>

              <select
                className={`status-select status-${reminder.status}`}
                value={reminder.status}
                onChange={(e) =>
                  onUpdateReminderStatus(
                    event.id,
                    reminder.id,
                    e.target.value as ReminderStatus
                  )
                }
              >
                {REMINDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ol>
      )}

      {isAdmin &&
        (showReminderForm ? (
          <ReminderForm
            teams={teams}
            onCreateTeam={onCreateTeam}
            onCreateReminder={(reminder) => {
              onAddReminder(event.id, reminder);
              setShowReminderForm(false);
            }}
            onCancel={() => setShowReminderForm(false)}
          />
        ) : (
          <button
            className="secondary-button add-reminder-button"
            onClick={() => setShowReminderForm(true)}
          >
            + Add Reminder
          </button>
        ))}

      <EventChat eventId={event.id} session={session} />

      {activeReminder && (
        <div className="reminder-popup-overlay">
          <div className="reminder-popup">
            <p className="reminder-popup-label">
              {activeReminder.teamName ?? "Reminder"}
            </p>
            <h2>{activeReminder.title}</h2>
            {activeReminder.message && (
              <p className="reminder-popup-message">{activeReminder.message}</p>
            )}
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
