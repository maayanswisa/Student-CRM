import { createClient } from "@/lib/supabase/server";
import { computeDebt } from "@/lib/debt";
import { startOfDay, addDays, startOfMonth, startOfNextMonth, isWithinNextDays } from "@/lib/dates";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { TodaySchedule, type TodayLessonRow } from "@/components/dashboard/today-schedule";
import { UnpaidDebtsList, type StudentDebtRow } from "@/components/dashboard/unpaid-debts";
import { UpcomingExams } from "@/components/dashboard/upcoming-exams";
import type { Lesson, Student } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: lessons }] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("lessons").select("*"),
  ]);

  const allStudents: Student[] = students ?? [];
  const allLessons: Lesson[] = lessons ?? [];
  const studentById = new Map(allStudents.map((s) => [s.id, s]));

  const activeStudents = allStudents.filter((s) => s.status === "active").length;

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const todaysLessons: TodayLessonRow[] = allLessons
    .filter((l) => {
      const dt = new Date(l.date_time);
      return dt >= today && dt < tomorrow;
    })
    .sort((a, b) => a.date_time.localeCompare(b.date_time))
    .flatMap((lesson) => {
      const student = studentById.get(lesson.student_id);
      return student
        ? [
            {
              ...lesson,
              student: {
                id: student.id,
                student_name: student.student_name,
                mother_name: student.mother_name,
                address: student.address,
                mother_phone: student.mother_phone,
              },
            },
          ]
        : [];
    });

  const unpaidCompleted = allLessons.filter((l) => l.status === "completed" && !l.is_paid);
  const debtsByStudent = new Map<string, Lesson[]>();
  for (const lesson of unpaidCompleted) {
    const list = debtsByStudent.get(lesson.student_id) ?? [];
    list.push(lesson);
    debtsByStudent.set(lesson.student_id, list);
  }
  const debtRows: StudentDebtRow[] = [...debtsByStudent.entries()].flatMap(([studentId, list]) => {
    const student = studentById.get(studentId);
    if (!student) return [];
    const debt = computeDebt(list);
    return [
      {
        ...debt,
        studentId,
        studentName: student.student_name,
        motherPhone: student.mother_phone,
      },
    ];
  });
  const totalUnpaid = debtRows.reduce((sum, d) => sum + d.totalOwed, 0);

  const monthStart = startOfMonth(new Date());
  const monthEnd = startOfNextMonth(new Date());
  const monthLessons = allLessons.filter((l) => {
    if (l.status !== "completed") return false;
    const dt = new Date(l.date_time);
    return dt >= monthStart && dt < monthEnd;
  });
  const monthPaid = monthLessons.filter((l) => l.is_paid).reduce((s, l) => s + Number(l.price), 0);
  const monthUnpaid = monthLessons
    .filter((l) => !l.is_paid)
    .reduce((s, l) => s + Number(l.price), 0);

  const upcomingExamStudents = allStudents.filter(
    (s) => s.upcoming_exam_date && isWithinNextDays(s.upcoming_exam_date, 7)
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">לוח בקרה</h1>
      <KpiCards
        activeStudents={activeStudents}
        totalUnpaid={totalUnpaid}
        todaysLessonsCount={todaysLessons.length}
        monthPaid={monthPaid}
        monthUnpaid={monthUnpaid}
      />
      <TodaySchedule lessons={todaysLessons} />
      <UnpaidDebtsList debts={debtRows} />
      <UpcomingExams students={upcomingExamStudents} />
    </div>
  );
}
