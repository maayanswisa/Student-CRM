import { createClient } from "@/lib/supabase/server";
import { NewLessonButton } from "@/components/lessons/new-lesson-button";
import { AllLessonsTable, type LessonRow } from "@/components/lessons/all-lessons-table";
import type { Lesson, Student } from "@/types/database";

export default async function LessonsPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: lessons }] = await Promise.all([
    supabase.from("students").select("*").order("student_name"),
    supabase.from("lessons").select("*"),
  ]);

  const allStudents: Student[] = students ?? [];
  const allLessons: Lesson[] = lessons ?? [];
  const studentById = new Map(allStudents.map((s) => [s.id, s]));

  const withStudent: LessonRow[] = allLessons.flatMap((lesson) => {
    const student = studentById.get(lesson.student_id);
    return student
      ? [{ ...lesson, student: { id: student.id, student_name: student.student_name } }]
      : [];
  });

  const upcoming = withStudent
    .filter((l) => l.status === "scheduled")
    .sort((a, b) => a.date_time.localeCompare(b.date_time));

  const history = withStudent
    .filter((l) => l.status !== "scheduled")
    .sort((a, b) => b.date_time.localeCompare(a.date_time));

  const activeStudents = allStudents.filter((s) => s.status === "active");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">שיעורים</h1>
        <NewLessonButton students={activeStudents} />
      </div>
      <AllLessonsTable title="שיעורים מתוכננים" lessons={upcoming} />
      <AllLessonsTable title="היסטוריה" lessons={history} />
      {upcoming.length === 0 && history.length === 0 && (
        <p className="text-sm text-muted-foreground">אין עדיין שיעורים במערכת</p>
      )}
    </div>
  );
}
