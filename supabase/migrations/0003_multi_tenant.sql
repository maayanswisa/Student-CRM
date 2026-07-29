-- Convert from single-admin to multi-tenant: each teacher (Supabase Auth
-- user) owns their own students and lessons, isolated from every other
-- teacher's data.

-- 1. Add teacher_id, nullable for now so we can backfill existing rows.
alter table students add column if not exists teacher_id uuid references auth.users(id) on delete cascade;
alter table lessons add column if not exists teacher_id uuid references auth.users(id) on delete cascade;

-- 2. Backfill: this project was single-admin until now, so every existing
-- row belongs to whichever auth user was created first (the current
-- tutor). If you've already created more than one user, run this BEFORE
-- inviting anyone else, or adjust the subquery to the correct user id.
update students
  set teacher_id = (select id from auth.users order by created_at asc limit 1)
  where teacher_id is null;

update lessons
  set teacher_id = (select s.teacher_id from students s where s.id = lessons.student_id)
  where teacher_id is null;

-- 3. From here on, every new row must have a teacher_id, and it defaults
-- to the inserting user automatically (the app never needs to set it
-- explicitly, so no code path can forget to).
alter table students alter column teacher_id set default auth.uid();
alter table students alter column teacher_id set not null;
alter table lessons alter column teacher_id set default auth.uid();
alter table lessons alter column teacher_id set not null;

create index if not exists students_teacher_id_idx on students (teacher_id);
create index if not exists lessons_teacher_id_idx on lessons (teacher_id);

-- 4. Replace the single-admin RLS policies with per-teacher isolation.
drop policy if exists "Authenticated users can manage students" on students;
create policy "Teachers manage their own students"
  on students for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "Authenticated users can manage lessons" on lessons;
create policy "Teachers manage their own lessons"
  on lessons for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
