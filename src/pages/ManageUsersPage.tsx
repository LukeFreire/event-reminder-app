import { useEffect, useState } from "react";
import type { Profile, UserRole } from "../types/Profile";
import * as usersApi from "../lib/usersApi";

interface ManageUsersPageProps {
  currentUserId: string;
  onBack: () => void;
}

function ManageUsersPage({ currentUserId, onBack }: ManageUsersPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .fetchAllProfiles()
      .then(setProfiles)
      .catch(() => setError("Couldn't load users."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSetRole(userId: string, role: UserRole) {
    await usersApi.setUserRole(userId, role);
    setProfiles(
      profiles.map((profile) =>
        profile.id === userId ? { ...profile, role } : profile
      )
    );
  }

  async function handleToggleDisabled(profile: Profile) {
    const nextDisabled = !profile.isDisabled;

    if (nextDisabled) {
      const confirmed = window.confirm(
        `Disable ${profile.email}? They'll be logged out, blocked from logging back in, and removed from all teams.`
      );
      if (!confirmed) return;
    }

    await usersApi.setUserDisabled(profile.id, nextDisabled);
    setProfiles(
      profiles.map((p) =>
        p.id === profile.id ? { ...p, isDisabled: nextDisabled } : p
      )
    );
  }

  return (
    <div className="teams-page">
      <div className="dashboard-top">
        <h2>Manage Users</h2>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to Events
        </button>
      </div>

      {isLoading ? (
        <p className="reminders-empty">Loading users...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ul className="team-member-list">
          {profiles.map((profile) => (
            <li key={profile.id} className="team-member-item">
              <span>
                {profile.email}
                {profile.id === currentUserId && " (you)"}
                {profile.isDisabled && (
                  <span className="status-badge status-missed"> disabled</span>
                )}
              </span>

              <div className="reminder-controls">
                <select
                  value={profile.role}
                  disabled={profile.id === currentUserId || profile.isDisabled}
                  onChange={(e) =>
                    handleSetRole(profile.id, e.target.value as UserRole)
                  }
                >
                  <option value="participant">Participant</option>
                  <option value="admin">Admin</option>
                </select>

                {profile.id !== currentUserId && (
                  <button
                    type="button"
                    className="secondary-button remove-reminder-button"
                    onClick={() => handleToggleDisabled(profile)}
                  >
                    {profile.isDisabled ? "Enable" : "Disable"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageUsersPage;
