import { supabase } from "./supabaseClient";
import type { Event } from "../types/Event";
import type { Reminder, ReminderStatus } from "../types/Reminder";
import type { Team } from "../types/Team";
import * as chatApi from "./chatApi";

interface ReminderRow {
  id: string;
  event_id: string;
  title: string;
  message: string;
  trigger_time: string;
  assigned_to: string[];
  status: ReminderStatus;
  team_id: string | null;
  teams: { name: string } | null;
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  call_time: string;
  start_time: string;
  end_time: string | null;
  location: string;
  created_by: string;
  reminders?: ReminderRow[];
}

// Postgres `time` columns come back as "HH:MM:SS"; our <input type="time">
// fields and sorting logic expect "HH:MM".
function toHHMM(time: string) {
  return time.slice(0, 5);
}

function mapReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    message: row.message,
    triggerTime: toHHMM(row.trigger_time),
    assignedTo: row.assigned_to,
    status: row.status,
    teamId: row.team_id,
    teamName: row.teams?.name ?? null,
  };
}

function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    callTime: toHHMM(row.call_time),
    startTime: toHHMM(row.start_time),
    endTime: row.end_time ? toHHMM(row.end_time) : undefined,
    location: row.location,
    createdBy: row.created_by,
    reminders: (row.reminders ?? []).map(mapReminder),
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*, reminders(*, teams(name))")
    .order("date", { ascending: true });

  if (error) throw error;

  return (data as EventRow[]).map(mapEvent);
}

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  return data as Team[];
}

export async function createTeam(name: string): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;

  return data as Team;
}

export async function createEvent(
  input: Omit<Event, "id" | "reminders">
): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description,
      date: input.date,
      call_time: input.callTime,
      start_time: input.startTime,
      end_time: input.endTime || null,
      location: input.location,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw error;

  return mapEvent({ ...(data as EventRow), reminders: [] });
}

export async function updateEvent(event: Event): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({
      title: event.title,
      description: event.description,
      date: event.date,
      call_time: event.callTime,
      start_time: event.startTime,
      end_time: event.endTime || null,
      location: event.location,
    })
    .eq("id", event.id);

  if (error) throw error;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) throw error;
}

export async function addReminder(
  eventId: string,
  input: Omit<Reminder, "id" | "eventId" | "teamName">
): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      event_id: eventId,
      title: input.title,
      message: input.message,
      trigger_time: input.triggerTime,
      assigned_to: input.assignedTo,
      status: input.status,
      team_id: input.teamId,
    })
    .select("*, teams(name)")
    .single();

  if (error) throw error;

  return mapReminder(data as ReminderRow);
}

export async function updateReminderStatus(
  reminderId: string,
  status: ReminderStatus
): Promise<void> {
  const { data, error } = await supabase
    .from("reminders")
    .update({ status })
    .eq("id", reminderId)
    .select("*, teams(name)")
    .single();

  if (error) throw error;

  const reminder = mapReminder(data as ReminderRow);
  const label = reminder.teamName ? `${reminder.teamName}: ` : "";

  // Best-effort: a bot-post failure shouldn't fail the status update itself.
  chatApi
    .postSystemMessage(
      reminder.eventId,
      `🔔 ${label}${reminder.title} → ${status}`
    )
    .catch((err) => console.error("Couldn't post status update to chat:", err));
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminderId);

  if (error) throw error;
}
