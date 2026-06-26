import type { Reminder } from "./Reminder";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  reminders: Reminder[];
  createdBy: string;
}