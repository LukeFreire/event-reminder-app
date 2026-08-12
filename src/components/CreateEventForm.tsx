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
  const [callTime, setCallTime] = useState("");
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
      callTime,
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
    setCallTime("");
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
        type="text"
        placeholder="Call Time"
        value={callTime}
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

    .<div className="form-buttons">
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