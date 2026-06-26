import { useState } from "react";
import type { Event } from "../types/Event";

interface CreateEventFormProps {
  onCreateEvent: (event: Event) => void;
  onCancel: () => void;
}

function CreateEventForm({
  onCreateEvent,
  onCancel,
}: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      createdBy: "demo-user",
      reminders: [],
    };

    onCreateEvent(newEvent);

    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Create Event</h2>

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
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />

      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

        <div className="form-buttons">
        <button className="primary-button" type="submit">
            Create Event
        </button>

        <button
            className="secondary-button"
            type="button"
            onClick={onCancel}
        >
            Cancel
        </button>
</div>
    </form>
  );
}

export default CreateEventForm;