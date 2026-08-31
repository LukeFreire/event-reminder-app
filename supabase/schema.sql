create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date date not null,
  call_time time not null,
  start_time time not null,
  end_time time,
  location text not null,
  created_by text not null default 'demo-user',
  created_at timestamptz not null default now()
);

create type reminder_status as enum ('pending', 'acknowledged', 'completed', 'missed');

create table reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  message text not null,
  trigger_time time not null,
  assigned_to text[] not null default '{}',
  status reminder_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- RLS is on by default for new tables in Supabase, which blocks all access
-- until a policy allows it. There's no login/auth built yet, so this policy
-- allows anyone with the anon key (i.e. anyone using the app) full access.
-- Tighten this once real auth exists (e.g. restrict by auth.uid()).
alter table events enable row level security;
alter table reminders enable row level security;

create policy "Allow all access to events" on events
  for all using (true) with check (true);

create policy "Allow all access to reminders" on reminders
  for all using (true) with check (true);
