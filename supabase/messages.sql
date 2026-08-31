-- user_id references profiles (not auth.users) so PostgREST can embed
-- "profiles(email)" when fetching message history -- same reasoning as
-- team_members.
create table messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Authenticated users can access messages" on messages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Adds this table to Supabase's Realtime publication, so inserts get
-- broadcast live over a websocket instead of requiring the app to poll.
alter publication supabase_realtime add table messages;
