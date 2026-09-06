alter table profiles
  add column role text not null default 'participant'
  check (role in ('admin', 'participant'));

-- security definer: runs with elevated privileges so it isn't itself
-- blocked by RLS, and other policies can safely call it to check role.
create function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Events: everyone signed in can read; only admins can create/edit/delete.
drop policy "Authenticated users can access events" on events;

create policy "Authenticated users can read events" on events
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert events" on events
  for insert with check (public.is_admin());

create policy "Admins can update events" on events
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete events" on events
  for delete using (public.is_admin());

-- Reminders: everyone can read AND update (status changes are how
-- participants do their job); only admins add/remove reminders entirely.
drop policy "Authenticated users can access reminders" on reminders;

create policy "Authenticated users can read reminders" on reminders
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can update reminders" on reminders
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admins can insert reminders" on reminders
  for insert with check (public.is_admin());

create policy "Admins can delete reminders" on reminders
  for delete using (public.is_admin());

-- Teams: everyone can read; only admins create/edit/delete.
drop policy "Authenticated users can access teams" on teams;

create policy "Authenticated users can read teams" on teams
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert teams" on teams
  for insert with check (public.is_admin());

create policy "Admins can update teams" on teams
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete teams" on teams
  for delete using (public.is_admin());

-- Team membership: everyone can read (so "My Reminders" etc. still work);
-- only admins add/remove members.
drop policy "Authenticated users can access team_members" on team_members;

create policy "Authenticated users can read team_members" on team_members
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert team_members" on team_members
  for insert with check (public.is_admin());

create policy "Admins can delete team_members" on team_members
  for delete using (public.is_admin());

-- Bootstrap: make your own account the first admin. Change the email if
-- your organizer login is different.
update profiles set role = 'admin' where email = 'lukefreire1@yahoo.com';
