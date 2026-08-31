import { useEffect, useState } from "react";
import type { Team, TeamMember } from "../types/Team";
import * as teamsApi from "../lib/teamsApi";

interface TeamsPageProps {
  teams: Team[];
  onBack: () => void;
}

function TeamsPage({ teams, onBack }: TeamsPageProps) {
  const [membersByTeam, setMembersByTeam] = useState<
    Record<string, TeamMember[]>
  >({});
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(teams.map((team) => teamsApi.fetchTeamMembers(team.id)))
      .then((results) => {
        const next: Record<string, TeamMember[]> = {};
        teams.forEach((team, i) => {
          next[team.id] = results[i];
        });
        setMembersByTeam(next);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Couldn't load teams."
        );
      })
      .finally(() => setIsLoading(false));
  }, [teams]);

  async function handleAddMember(teamId: string) {
    const email = (emailInputs[teamId] ?? "").trim();
    if (!email) return;

    setErrors({ ...errors, [teamId]: null });

    try {
      const member = await teamsApi.addTeamMemberByEmail(teamId, email);
      setMembersByTeam({
        ...membersByTeam,
        [teamId]: [...(membersByTeam[teamId] ?? []), member],
      });
      setEmailInputs({ ...emailInputs, [teamId]: "" });
    } catch (err) {
      setErrors({
        ...errors,
        [teamId]: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  async function handleRemoveMember(teamId: string, memberId: string) {
    await teamsApi.removeTeamMember(memberId);
    setMembersByTeam({
      ...membersByTeam,
      [teamId]: (membersByTeam[teamId] ?? []).filter(
        (member) => member.id !== memberId
      ),
    });
  }

  return (
    <div className="teams-page">
      <div className="dashboard-top">
        <h2>Manage Teams</h2>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to Events
        </button>
      </div>

      {isLoading ? (
        <p className="reminders-empty">Loading teams...</p>
      ) : loadError ? (
        <p className="error-message">{loadError}</p>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-manage-card">
              <h3>{team.name}</h3>

              {(membersByTeam[team.id] ?? []).length === 0 ? (
                <p className="reminders-empty">No members yet.</p>
              ) : (
                <ul className="team-member-list">
                  {(membersByTeam[team.id] ?? []).map((member) => (
                    <li key={member.id} className="team-member-item">
                      <span>{member.email}</span>
                      <button
                        type="button"
                        className="secondary-button remove-reminder-button"
                        onClick={() => handleRemoveMember(team.id, member.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {errors[team.id] && (
                <p className="error-message">{errors[team.id]}</p>
              )}

              <div className="new-team-row">
                <input
                  type="email"
                  placeholder="Add by email"
                  value={emailInputs[team.id] ?? ""}
                  onChange={(e) =>
                    setEmailInputs({
                      ...emailInputs,
                      [team.id]: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleAddMember(team.id)}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamsPage;
