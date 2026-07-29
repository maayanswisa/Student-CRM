import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekStart } from "@/lib/schedule-week";
import { WeeklyScheduleGrid } from "@/components/schedule/weekly-schedule-grid";

export default async function SchedulePage() {
  const supabase = await createClient();

  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [{ data: students }, { data: weekLessons }] = await Promise.all([
    supabase.from("students").select("*").eq("status", "active").order("student_name"),
    supabase
      .from("lessons")
      .select("*")
      .gte("date_time", weekStart.toISOString())
      .lt("date_time", weekEnd.toISOString()),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">שיעורים השבוע</h1>
      <WeeklyScheduleGrid students={students ?? []} weekLessons={weekLessons ?? []} />
    </div>
  );
}
