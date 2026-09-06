import { supabase } from "./supabaseClient";
import type { Profile, UserRole } from "../types/Profile";

interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
  is_disabled: boolean;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    isDisabled: row.is_disabled,
  };
}

export async function fetchMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, is_disabled")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return mapProfile(data as ProfileRow);
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, is_disabled")
    .order("email", { ascending: true });

  if (error) throw error;

  return (data as ProfileRow[]).map(mapProfile);
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
}

export async function setUserDisabled(
  userId: string,
  isDisabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_disabled: isDisabled })
    .eq("id", userId);

  if (error) throw error;

  if (isDisabled) {
    const { error: teamError } = await supabase
      .from("team_members")
      .delete()
      .eq("user_id", userId);

    if (teamError) throw teamError;
  }
}
