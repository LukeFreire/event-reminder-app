alter table profiles add column is_disabled boolean not null default false;

-- A disabled admin loses admin powers too.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and coalesce(is_disabled, false) = false
  );
$$;

create function public.is_active_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and coalesce(is_disabled, false) = false
  );
$$;

-- Replace every "any authenticated user" check with "any active
-- (non-disabled) user" -- this is what actually locks a disabled account
-- out at the database level, even if their browser still holds a valid
-- session token.

drop policy "Authenticated users can read events" on events;
create policy "Active users can read events" on events
  for select using (public.is_active_user());

drop policy "Authenticated users can read reminders" on reminders;
create policy "Active users can read reminders" on reminders
  for select using (public.is_active_user());

drop policy "Authenticated users can update reminders" on reminders;
create policy "Active users can update reminders" on reminders
  for update using (public.is_active_user()) with check (public.is_active_user());

drop policy "Authenticated users can read teams" on teams;
create policy "Active users can read teams" on teams
  for select using (public.is_active_user());

drop policy "Authenticated users can read team_members" on team_members;
create policy "Active users can read team_members" on team_members
  for select using (public.is_active_user());

drop policy "Authenticated users can read profiles" on profiles;
create policy "Active users can read profiles" on profiles
  for select using (public.is_active_user());

-- messages previously had one "for all" policy; split into select/insert
-- (the app never updates or deletes messages, so those are dropped, not
-- just re-gated).
drop policy "Authenticated users can access messages" on messages;

create policy "Active users can read messages" on messages
  for select using (public.is_active_user());

create policy "Active users can insert messages" on messages
  for insert with check (public.is_active_user());
