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
  teamId: string | null;
  teamName: string | null;
}

export interface MyReminder extends Reminder {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}