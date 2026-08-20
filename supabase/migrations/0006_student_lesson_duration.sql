-- Default lesson duration per student, mirrors hourly_rate as a per-student
-- default that pre-fills new lessons.

alter table students
  add column if not exists default_lesson_duration_minutes integer not null default 60;
