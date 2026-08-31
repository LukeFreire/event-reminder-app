-- team_members.user_id originally pointed at auth.users, but PostgREST
-- can only auto-embed a join (e.g. "profiles(email)") across an actual
-- foreign key in the public schema. Repointing it at profiles.id fixes
-- that -- it's still effectively tied to auth.users, since profiles.id
-- itself references auth.users(id).
alter table team_members drop constraint team_members_user_id_fkey;

alter table team_members
  add constraint team_members_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
