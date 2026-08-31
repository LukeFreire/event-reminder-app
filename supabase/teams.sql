create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table teams enable row level security;

create policy "Authenticated users can access teams" on teams
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into teams (name) values ('Sound'), ('Lighting'), ('Lyrics / ProPresenter');

-- Nullable + "set null" on delete: a reminder can exist without a team,
-- and deleting a team un-tags its reminders instead of deleting them.
alter table reminders
  add column team_id uuid references teams(id) on delete set null;
