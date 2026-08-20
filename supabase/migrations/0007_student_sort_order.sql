-- Manual drag-and-drop ordering for the students list. Existing rows are
-- backfilled with their current (name-sorted) position so the list doesn't
-- visibly reshuffle the first time this ships.
alter table students add column if not exists sort_order integer;

with ranked as (
  select id, row_number() over (partition by teacher_id order by student_name) as rn
  from students
  where sort_order is null
)
update students set sort_order = ranked.rn
from ranked
where students.id = ranked.id;

alter table students alter column sort_order set not null;
alter table students alter column sort_order set default 0;
