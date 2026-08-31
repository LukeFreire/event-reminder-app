-- Bot/system messages (e.g. "Reminder X -> completed") aren't sent by a
-- real person, so user_id needs to allow null. NULL user_id means "system".
alter table messages alter column user_id drop not null;
