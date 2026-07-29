import { createClient } from "@/lib/supabase/server";
import { WeeklyScheduleGrid } from "@/components/schedule/weekly-schedule-grid";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .order("student_name");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">שיעורים השבוע</h1>
      <WeeklyScheduleGrid students={students ?? []} />
    </div>
  );
}
