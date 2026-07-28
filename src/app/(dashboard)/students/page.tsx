import { createClient } from "@/lib/supabase/server";
import { StudentsToolbar } from "@/components/students/students-toolbar";
import { StudentTable } from "@/components/students/student-table";
import type { StudentStatus } from "@/types/database";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; grade?: string }>;
}) {
  const { q, status = "active", grade } = await searchParams;

  const supabase = await createClient();
  let query = supabase.from("students").select("*").order("student_name");

  if (status && status !== "all") {
    query = query.eq("status", status as StudentStatus);
  }
  if (grade && grade !== "all") {
    query = query.eq("grade", grade);
  }
  if (q) {
    query = query.or(`student_name.ilike.%${q}%,school.ilike.%${q}%`);
  }

  const { data: students, error } = await query;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">תלמידים</h1>
      <StudentsToolbar />
      {error ? (
        <p className="text-sm text-destructive">שגיאה בטעינת התלמידים: {error.message}</p>
      ) : (
        <StudentTable students={students ?? []} />
      )}
    </div>
  );
}
