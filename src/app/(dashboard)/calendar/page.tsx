import { createClient } from "@/lib/supabase/server";
import { LessonCalendar } from "@/components/calendar/lesson-calendar";
import type { Lesson, LessonWithStudent, Student } from "@/types/database";

export default async function CalendarPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: lessons }] = await Promise.all([
    supabase.from("students").select("*").order("student_name"),
    supabase.from("lessons").select("*"),
  ]);

  const allStudents: Student[] = students ?? [];
  const allLessons: Lesson[] = lessons ?? [];
  const studentById = new Map(allStudents.map((s) => [s.id, s]));

  const lessonsWithStudent: LessonWithStudent[] = allLessons.flatMap((lesson) => {
    const student = studentById.get(lesson.student_id);
    return student
      ? [
          {
            ...lesson,
            student: {
              id: student.id,
              student_name: student.student_name,
              mother_phone: student.mother_phone,
              student_phone: student.student_phone,
              hourly_rate: student.hourly_rate,
            },
          },
        ]
      : [];
  });

  const activeStudents = allStudents.filter((s) => s.status === "active");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">יומן שיעורים</h1>
      <LessonCalendar students={activeStudents} lessons={lessonsWithStudent} />
    </div>
  );
}
