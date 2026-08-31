-- Replaces the wide-open "allow all" policies from schema.sql now that
-- real login exists. Only signed-in users (any authenticated user, not
-- just the row's creator) can read/write events and reminders; the
-- anon key alone (no session) gets nothing.

drop policy "Allow all access to events" on events;
drop policy "Allow all access to reminders" on reminders;

create policy "Authenticated users can access events" on events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can access reminders" on reminders
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
