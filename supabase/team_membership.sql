-- The client can't query auth.users directly (Supabase blocks that for
-- security), so we mirror just the id + email into a public "profiles"
-- table whenever someone signs up. That's what lets an organizer look
-- someone up by email to add them to a team.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Authenticated users can read profiles" on profiles
  for select
  using (auth.role() = 'authenticated');

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: anyone who signed up before this trigger existed won't have
-- a profile row yet. Safe to run once now.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- user_id references profiles (not auth.users directly) so PostgREST can
-- auto-embed "profiles(email)" in queries -- it needs an actual foreign
-- key in the public schema to build that join.
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

alter table team_members enable row level security;

create policy "Authenticated users can access team_members" on team_members
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
