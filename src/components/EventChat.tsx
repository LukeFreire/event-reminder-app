import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { ChatMessage } from "../types/ChatMessage";
import * as chatApi from "../lib/chatApi";

interface EventChatProps {
  eventId: string;
  session: Session;
}

function EventChat({ eventId, session }: EventChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emailCacheRef = useRef<Map<string, string>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi
      .fetchMessages(eventId)
      .then((fetched) => {
        setMessages(fetched);
        fetched.forEach((message) => {
          if (message.userId) {
            emailCacheRef.current.set(message.userId, message.senderEmail);
          }
        });
      })
      .catch(() => setError("Couldn't load chat."))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  useEffect(() => {
    const unsubscribe = chatApi.subscribeToMessages(eventId, async (row) => {
      let email: string;

      if (row.user_id === null) {
        email = "System";
      } else {
        const cached = emailCacheRef.current.get(row.user_id);
        email =
          cached ??
          (row.user_id === session.user.id
            ? session.user.email ?? "you"
            : await chatApi.fetchSenderEmail(row.user_id).catch(() => "(unknown)"));
        emailCacheRef.current.set(row.user_id, email);
      }

      setMessages((prev) => {
        if (prev.some((message) => message.id === row.id)) return prev;

        return [
          ...prev,
          {
            id: row.id,
            eventId: row.event_id,
            userId: row.user_id,
            senderEmail: email,
            body: row.body,
            createdAt: row.created_at,
          },
        ];
      });
    });

    return unsubscribe;
  }, [eventId, session.user.id, session.user.email]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setBody("");

    try {
      const sent = await chatApi.sendMessage(eventId, session.user.id, trimmed);
      if (sent.userId) {
        emailCacheRef.current.set(sent.userId, sent.senderEmail);
      }
      setMessages((prev) =>
        prev.some((message) => message.id === sent.id) ? prev : [...prev, sent]
      );
    } catch {
      setError("Couldn't send that message.");
    }
  }

  return (
    <div className="event-chat">
      <strong>Chat</strong>

      {error && <p className="error-message">{error}</p>}

      <div className="chat-message-list" ref={listRef}>
        {isLoading ? (
          <p className="reminders-empty">Loading chat...</p>
        ) : error ? null : messages.length === 0 ? (
          <p className="reminders-empty">No messages yet — say hi.</p>
        ) : (
          messages.map((message) =>
            message.userId === null ? (
              <p key={message.id} className="chat-message-system">
                {message.body}
              </p>
            ) : (
              <div
                key={message.id}
                className={
                  message.userId === session.user.id
                    ? "chat-message chat-message-own"
                    : "chat-message"
                }
              >
                <span className="chat-message-sender">
                  {message.senderEmail}
                </span>
                <p className="chat-message-body">{message.body}</p>
              </div>
            )
          )
        )}
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Message the team..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="primary-button" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

export default EventChat;
