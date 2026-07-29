import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeDebt } from "@/lib/debt";
import { StudentDetailHeader } from "@/components/students/student-detail-header";
import { LessonHistoryTable } from "@/components/lessons/lesson-history-table";
import { ExamScoresSection } from "@/components/students/exam-scores-section";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: lessons }, { data: examScores }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("lessons")
      .select("*")
      .eq("student_id", id)
      .order("date_time", { ascending: false }),
    supabase
      .from("exam_scores")
      .select("*")
      .eq("student_id", id)
      .order("exam_date", { ascending: false }),
  ]);

  if (!student) notFound();

  const debt = computeDebt(lessons ?? []);

  return (
    <div className="flex flex-col gap-4">
      <StudentDetailHeader student={student} debt={debt} lessons={lessons ?? []} />
      <ExamScoresSection studentId={student.id} scores={examScores ?? []} />
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
