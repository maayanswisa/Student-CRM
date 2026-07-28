-- Tables created via the SQL Editor don't automatically get the role
-- grants Supabase's Table Editor UI would normally add, so `authenticated`
-- gets "permission denied for table students" even though RLS policies
-- would otherwise allow it. Grant the base table privileges explicitly.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
