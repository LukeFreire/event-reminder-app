import { supabase } from "./supabaseClient";
import type { ChatMessage } from "../types/ChatMessage";

interface MessageRow {
  id: string;
  event_id: string;
  user_id: string | null;
  body: string;
  created_at: string;
  profiles: { email: string } | null;
}

export interface RawMessageRow {
  id: string;
  event_id: string;
  user_id: string | null;
  body: string;
  created_at: string;
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    senderEmail:
      row.user_id === null ? "System" : row.profiles?.email ?? "(unknown)",
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchMessages(eventId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles(email)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as MessageRow[]).map(mapMessage);
}

export async function sendMessage(
  eventId: string,
  userId: string,
  body: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ event_id: eventId, user_id: userId, body })
    .select("*, profiles(email)")
    .single();

  if (error) throw error;

  return mapMessage(data as MessageRow);
}

export async function postSystemMessage(
  eventId: string,
  body: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ event_id: eventId, user_id: null, body })
    .select("*, profiles(email)")
    .single();

  if (error) throw error;

  return mapMessage(data as MessageRow);
}

export async function fetchSenderEmail(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data.email as string;
}

// Realtime "postgres_changes" payloads only carry the raw table row -- no
// joined data like profiles(email) -- so callers get the raw row and are
// responsible for resolving the sender's email themselves (see EventChat).
export function subscribeToMessages(
  eventId: string,
  onInsert: (row: RawMessageRow) => void
): () => void {
  const channel = supabase
    .channel(`messages-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => onInsert(payload.new as RawMessageRow)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
