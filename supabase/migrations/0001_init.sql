-- Personal Tutor CRM schema
-- Single-admin app: RLS simply requires an authenticated session, no per-row ownership.

create extension if not exists "pgcrypto";

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_name text not null,
  mother_name text not null,
  student_phone text,
  mother_phone text not null,
  address text not null,
  grade text not null,
  academic_level text not null,
  school text not null,
  hourly_rate numeric(10, 2) not null default 0,
  preferred_learning_day text[] not null default '{}',
  preferred_learning_time text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  notes text,
  upcoming_exam_date date
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_id uuid not null references students(id) on delete cascade,
  date_time timestamptz not null,
  duration_minutes integer not null default 60,
  price numeric(10, 2) not null default 0,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled_in_time', 'cancelled_late')),
  is_paid boolean not null default false,
  payment_method text check (payment_method in ('bit', 'paybox', 'cash', 'bank_transfer')),
  payment_date timestamptz,
  lesson_summary text
);

create index if not exists lessons_student_id_idx on lessons (student_id);
create index if not exists lessons_date_time_idx on lessons (date_time);
create index if not exists students_status_idx on students (status);

alter table students enable row level security;
alter table lessons enable row level security;

-- Postgres has no "create policy if not exists", so drop-then-create
-- keeps this migration safe to run more than once (e.g. Supabase's GitHub
-- integration re-running it after it was first applied by hand).
drop policy if exists "Authenticated users can manage students" on students;
create policy "Authenticated users can manage students"
  on students for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage lessons" on lessons;
create policy "Authenticated users can manage lessons"
  on lessons for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
