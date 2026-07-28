import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeDebt } from "@/lib/debt";
import { StudentDetailHeader } from "@/components/students/student-detail-header";
import { LessonHistoryTable } from "@/components/lessons/lesson-history-table";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: lessons }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("lessons")
      .select("*")
      .eq("student_id", id)
      .order("date_time", { ascending: false }),
  ]);

  if (!student) notFound();

  const debt = computeDebt(lessons ?? []);

  return (
    <div className="flex flex-col gap-4">
      <StudentDetailHeader student={student} debt={debt} />
      <h2 className="text-lg font-semibold">היסטוריית שיעורים</h2>
      <LessonHistoryTable
        lessons={lessons ?? []}
        studentId={student.id}
        studentName={student.student_name}
        hourlyRate={student.hourly_rate}
      />
    </div>
  );
}
