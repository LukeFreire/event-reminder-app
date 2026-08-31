export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string | null;
  senderEmail: string;
  body: string;
  createdAt: string;
}
