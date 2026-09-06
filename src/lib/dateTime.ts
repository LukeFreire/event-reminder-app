// Combines a stored "YYYY-MM-DD" date and "HH:MM" time into a real Date,
// so it can be compared against the live clock (e.g. "has this reminder's
// trigger time passed?", "has the event's start time arrived?").
export function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}
