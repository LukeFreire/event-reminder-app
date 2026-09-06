-- assigned_to (free-text names) was replaced by team_id once teams
-- existed, and was never actually displayed anywhere in the app.
alter table reminders drop column assigned_to;
