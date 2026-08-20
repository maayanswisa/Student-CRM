import { createClient } from "@/lib/supabase/server";
import { NewLessonButton } from "@/components/lessons/new-lesson-button";
import { LessonsExportButton } from "@/components/lessons/lessons-export-button";
import { LessonsBoard } from "@/components/lessons/lessons-board";
import type { LessonRow } from "@/components/lessons/all-lessons-table";
import { getSessionLabelServer } from "@/lib/session-label-server";
import type { Lesson, Student } from "@/types/database";

export default async function LessonsPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: lessons }, sessionLabel] = await Promise.all([
    supabase.from("students").select("*").order("student_name"),
    supabase.from("lessons").select("*"),
    getSessionLabelServer(),
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
        <h1 className="text-2xl font-semibold">{sessionLabel.plural}</h1>
        <div className="flex gap-2">
          <LessonsExportButton />
          <NewLessonButton students={activeStudents} />
        </div>
      </div>
      <LessonsBoard
        upcoming={upcoming}
        history={history}
        students={allStudents.map((s) => ({ id: s.id, student_name: s.student_name }))}
      />
    </div>
  );
}
