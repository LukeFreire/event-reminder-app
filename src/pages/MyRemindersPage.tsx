import { useEffect, useState } from "react";
import type { MyReminder, ReminderStatus } from "../types/Reminder";
import * as teamsApi from "../lib/teamsApi";
import * as eventsApi from "../lib/eventsApi";
import { formatTime } from "../lib/formatTime";

interface MyRemindersPageProps {
  teamIds: string[];
  onBack: () => void;
}

const REMINDER_STATUSES: ReminderStatus[] = [
  "pending",
  "acknowledged",
  "completed",
  "missed",
];

function MyRemindersPage({ teamIds, onBack }: MyRemindersPageProps) {
  const [reminders, setReminders] = useState<MyReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    teamsApi
      .fetchRemindersForTeams(teamIds)
      .then(setReminders)
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Couldn't load your reminders."
        );
      })
      .finally(() => setIsLoading(false));
  }, [teamIds]);

  async function handleUpdateStatus(reminderId: string, status: ReminderStatus) {
    await eventsApi.updateReminderStatus(reminderId, status);
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, status } : reminder
      )
    );
  }

  const sortedReminders = [...reminders].sort((a, b) =>
    `${a.eventDate}T${a.triggerTime}`.localeCompare(
      `${b.eventDate}T${b.triggerTime}`
    )
  );

  return (
    <div className="my-reminders-page">
      <div className="dashboard-top">
        <h2>My Reminders</h2>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to Events
        </button>
      </div>

      {isLoading ? (
        <p className="reminders-empty">Loading your reminders...</p>
      ) : loadError ? (
        <p className="error-message">{loadError}</p>
      ) : sortedReminders.length === 0 ? (
        <p className="reminders-empty">
          No reminders assigned to your teams yet.
        </p>
      ) : (
        <ul className="reminders-list">
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
                  {reminder.eventTitle} · {reminder.eventDate} ·{" "}
                  {formatTime(reminder.triggerTime)} · {reminder.message}
                </p>
              </div>

              <select
                value={reminder.status}
                onChange={(e) =>
                  handleUpdateStatus(
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
        </ul>
      )}
    </div>
  );
}

export default MyRemindersPage;
