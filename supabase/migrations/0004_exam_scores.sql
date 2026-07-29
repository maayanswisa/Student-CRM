-- Exam / progress tracker: log exam dates, subjects, and scores per student
-- so tutors can see academic progress over time.

create table if not exists exam_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  teacher_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  student_id uuid not null references students(id) on delete cascade,
  exam_date date not null,
  subject text not null,
  score numeric(5, 2) not null,
  notes text
);

create index if not exists exam_scores_student_id_idx on exam_scores (student_id);
create index if not exists exam_scores_teacher_id_idx on exam_scores (teacher_id);

grant select, insert, update, delete on exam_scores to authenticated;

alter table exam_scores enable row level security;

drop policy if exists "Teachers manage their own exam scores" on exam_scores;
create policy "Teachers manage their own exam scores"
  on exam_scores for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
