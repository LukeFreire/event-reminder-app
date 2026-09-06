-- The reminder form no longer collects a message (simplified to
-- title + trigger time + team), so it needs to be optional.
alter table reminders alter column message drop not null;
