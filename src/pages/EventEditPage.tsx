import { useState } from "react";
import type { Event } from "../types/Event";
import type { Reminder, ReminderStatus } from "../types/Reminder";
import type { Team } from "../types/Team";
import ReminderForm from "../components/ReminderForm";
import { formatTime } from "../lib/formatTime";

interface EventEditPageProps {
  event: Event;
  teams: Team[];
  onSave: (event: Event) => void;
  onCancel: () => void;
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
  onDeleteReminder: (eventId: string, reminderId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

const REMINDER_STATUSES: ReminderStatus[] = [
  "pending",
  "acknowledged",
  "completed",
  "missed",
];

function EventEditPage({
  event,
  teams,
  onSave,
  onCancel,
  onAddReminder,
  onCreateTeam,
  onUpdateReminderStatus,
  onDeleteReminder,
  onDeleteEvent,
}: EventEditPageProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.date);
  const [callTime, setCallTime] = useState(event.callTime);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime ?? "");
  const [location, setLocation] = useState(event.location);
  const [showReminderForm, setShowReminderForm] = useState(false);

  const sortedReminders = [...event.reminders].sort((a, b) =>
    a.triggerTime.localeCompare(b.triggerTime)
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    onSave({
      ...event,
      title,
      description,
      date,
      callTime,
      startTime,
      endTime,
      location,
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This also deletes all of its reminders. This can't be undone.`
    );

    if (confirmed) {
      onDeleteEvent(event.id);
    }
  }

  return (
    <div className="event-edit-page">
      <div className="dashboard-top">
        <h2>Event Edit Page</h2>
        <div className="edit-page-actions">
          <button
            className="secondary-button remove-reminder-button"
            type="button"
            onClick={handleDelete}
          >
            Delete Event
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            Back to Events
          </button>
        </div>
      </div>

      <form className="create-form" onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type={date ? "date" : "text"}
          placeholder="Date"
          value={date}
          onFocus={(e) => {
            e.currentTarget.type = "date";
          }}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <input
          type={callTime ? "time" : "text"}
          placeholder="Call Time"
          value={callTime}
          onFocus={(e) => {
            e.currentTarget.type = "time";
          }}
          onChange={(e) => setCallTime(e.target.value)}
          required
        />

        <input
          type={startTime ? "time" : "text"}
          placeholder="Start Time"
          value={startTime}
          onFocus={(e) => {
            e.currentTarget.type = "time";
          }}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <input
          type={endTime ? "time" : "text"}
          placeholder="End Time (Optional)"
          value={endTime}
          onFocus={(e) => {
            e.currentTarget.type = "time";
          }}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <button className="primary-button" type="submit">
          Save Changes
        </button>
      </form>

      <div className="reminders-section">
        <h3>Reminders</h3>

        {sortedReminders.length === 0 ? (
          <p className="reminders-empty">No reminders yet.</p>
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

                <div className="reminder-controls">
                  <select
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

                  <button
                    type="button"
                    className="secondary-button remove-reminder-button"
                    onClick={() => onDeleteReminder(event.id, reminder.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {showReminderForm ? (
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
        )}
      </div>
    </div>
  );
}

export default EventEditPage;
