import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getPlatformAnalytics } from "@/actions/admin";
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards";
import { TeacherActivityTable } from "@/components/admin/teacher-activity-table";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!isAdminEmail(data.user?.email)) {
    redirect("/");
  }

  const analytics = await getPlatformAnalytics();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">ניהול פלטפורמה</h1>
      <AdminKpiCards
        totalTeachers={analytics.totalTeachers}
        newThisWeek={analytics.newThisWeek}
        newThisMonth={analytics.newThisMonth}
        totalActiveStudents={analytics.totalActiveStudents}
        totalLessons={analytics.totalLessons}
      />
      <h2 className="text-lg font-semibold">פעילות מורים</h2>
      <TeacherActivityTable teachers={analytics.teachers} />
    </div>
  );
}
