export type ReminderStatus =
  | "pending"
  | "acknowledged"
  | "completed"
  | "missed";

export interface Reminder {
  id: string;
  eventId: string;
  title: string;
  message: string;
  triggerTime: string;
  assignedTo: string[];
  status: ReminderStatus;
}