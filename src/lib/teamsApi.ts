import { supabase } from "./supabaseClient";
import type { Team, TeamMember } from "../types/Team";
import type { MyReminder, ReminderStatus } from "../types/Reminder";

interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  profiles: { email: string } | null;
}

interface MyReminderRow {
  id: string;
  event_id: string;
  title: string;
  message: string;
  trigger_time: string;
  assigned_to: string[];
  status: ReminderStatus;
  team_id: string | null;
  teams: { name: string } | null;
  events: { title: string; date: string; location: string } | null;
}

function toHHMM(time: string) {
  return time.slice(0, 5);
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    email: row.profiles?.email ?? "(unknown user)",
  };
}

export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*, profiles(email)")
    .eq("team_id", teamId);

  if (error) throw error;

  return (data as TeamMemberRow[]).map(mapTeamMember);
}

export async function addTeamMemberByEmail(
  teamId: string,
  email: string
): Promise<TeamMember> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", email.trim())
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    throw new Error(
      `No account found for "${email}" — they need to sign up first.`
    );
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: profile.id })
    .select("*, profiles(email)")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`${profile.email} is already on this team.`);
    }
    throw error;
  }

  return mapTeamMember(data as TeamMemberRow);
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
}

export async function fetchMyTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("teams(id, name)")
    .eq("user_id", userId);

  if (error) throw error;

  return (data as unknown as { teams: Team }[])
    .map((row) => row.teams)
    .filter((team): team is Team => team !== null);
}

export async function fetchRemindersForTeams(
  teamIds: string[]
): Promise<MyReminder[]> {
  if (teamIds.length === 0) return [];

  const { data, error } = await supabase
    .from("reminders")
    .select("*, teams(name), events(title, date, location)")
    .in("team_id", teamIds);

  if (error) throw error;

  return (data as MyReminderRow[])
    .filter((row) => row.events !== null)
    .map((row) => ({
      id: row.id,
      eventId: row.event_id,
      title: row.title,
      message: row.message,
      triggerTime: toHHMM(row.trigger_time),
      assignedTo: row.assigned_to,
      status: row.status,
      teamId: row.team_id,
      teamName: row.teams?.name ?? null,
      eventTitle: row.events!.title,
      eventDate: row.events!.date,
      eventLocation: row.events!.location,
    }));
}
