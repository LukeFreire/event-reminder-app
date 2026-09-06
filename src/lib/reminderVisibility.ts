import type { Reminder } from "../types/Reminder";

// A team-less reminder is everyone's concern; a team-scoped one is only
// visible to members of that team. Callers decide separately whether an
// admin bypasses this (admins currently see everything, everywhere).
export function isVisibleToViewer(
  reminder: Reminder,
  myTeamIds: string[]
): boolean {
  if (reminder.teamId === null) return true;
  return myTeamIds.includes(reminder.teamId);
}
