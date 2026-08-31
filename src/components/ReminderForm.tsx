import { useState } from "react";
import type { Reminder } from "../types/Reminder";
import type { Team } from "../types/Team";

const NEW_TEAM_OPTION = "__new__";

interface ReminderFormProps {
  teams: Team[];
  onCreateReminder: (
    reminder: Omit<Reminder, "id" | "eventId" | "teamName">
  ) => void;
  onCreateTeam: (name: string) => Promise<Team>;
  onCancel: () => void;
}

function ReminderForm({
  teams,
  onCreateReminder,
  onCreateTeam,
  onCancel,
}: ReminderFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [triggerTime, setTriggerTime] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [teamId, setTeamId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  async function handleAddTeam() {
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    const team = await onCreateTeam(newTeamName.trim());
    setIsCreatingTeam(false);

    setTeamId(team.id);
    setNewTeamName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onCreateReminder({
      title,
      message,
      triggerTime,
      assignedTo: assignedTo
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      status: "pending",
      teamId: teamId || null,
    });

    setTitle("");
    setMessage("");
    setTriggerTime("");
    setAssignedTo("");
    setTeamId("");
  }

  return (
    <form className="create-form reminder-form" onSubmit={handleSubmit}>
      <h4>Add Reminder</h4>

      <input
        type="text"
        placeholder="Reminder title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <input
        type={triggerTime ? "time" : "text"}
        placeholder="Trigger Time"
        value={triggerTime}
        onFocus={(e) => {
          e.currentTarget.type = "time";
        }}
        onChange={(e) => setTriggerTime(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Assigned to (comma-separated names)"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
      />

      <select
        value={teamId === "" ? "" : teamId}
        onChange={(e) => {
          if (e.target.value === NEW_TEAM_OPTION) {
            setTeamId(NEW_TEAM_OPTION);
          } else {
            setTeamId(e.target.value);
          }
        }}
      >
        <option value="">No team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
        <option value={NEW_TEAM_OPTION}>+ New team...</option>
      </select>

      {teamId === NEW_TEAM_OPTION && (
        <div className="new-team-row">
          <input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <button
            type="button"
            className="secondary-button"
            onClick={handleAddTeam}
            disabled={isCreatingTeam}
          >
            Add
          </button>
        </div>
      )}

      <div className="form-buttons">
        <button className="primary-button" type="submit">
          Add Reminder
        </button>
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReminderForm;
