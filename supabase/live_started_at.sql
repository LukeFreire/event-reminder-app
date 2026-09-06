-- Tracks whether an admin has actually started the live session for this
-- event, so participants (on other devices/sessions) can know whether
-- they're allowed to join yet -- rather than "Go Live" being purely a
-- local navigation action with no shared state.
alter table events add column live_started_at timestamptz;
