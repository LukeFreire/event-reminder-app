// Converts a stored "HH:MM" (24-hour) time string into a 12-hour
// display string, e.g. "17:30" -> "5:30 PM".
export function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${minutesStr} ${period}`;
}
