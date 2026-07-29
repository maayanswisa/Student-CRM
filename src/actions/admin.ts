"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!isAdminEmail(email)) {
    throw new Error("אין הרשאה לצפות בנתונים אלו");
  }
  return email!;
}

export interface TeacherActivityRow {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  studentsManaged: number;
  lessonsLogged: number;
}

export interface PlatformAnalytics {
  totalTeachers: number;
  newThisWeek: number;
  newThisMonth: number;
  totalActiveStudents: number;
  totalLessons: number;
  teachers: TeacherActivityRow[];
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  await requireAdmin();

  const admin = createAdminClient();

  const [{ data: usersData, error: usersError }, { data: students, error: studentsError }, { data: lessons, error: lessonsError }] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("students").select("id, teacher_id, status"),
      admin.from("lessons").select("id, teacher_id"),
    ]);

  if (usersError) throw new Error(usersError.message);
  if (studentsError) throw new Error(studentsError.message);
  if (lessonsError) throw new Error(lessonsError.message);

  const teacherUsers = usersData.users;

  const studentsByTeacher = new Map<string, number>();
  for (const s of students ?? []) {
    studentsByTeacher.set(s.teacher_id, (studentsByTeacher.get(s.teacher_id) ?? 0) + 1);
  }

  const lessonsByTeacher = new Map<string, number>();
  for (const l of lessons ?? []) {
    lessonsByTeacher.set(l.teacher_id, (lessonsByTeacher.get(l.teacher_id) ?? 0) + 1);
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const teachers: TeacherActivityRow[] = teacherUsers
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      studentsManaged: studentsByTeacher.get(u.id) ?? 0,
      lessonsLogged: lessonsByTeacher.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    totalTeachers: teacherUsers.length,
    newThisWeek: teacherUsers.filter((u) => new Date(u.created_at) >= weekAgo).length,
    newThisMonth: teacherUsers.filter((u) => new Date(u.created_at) >= monthAgo).length,
    totalActiveStudents: (students ?? []).filter((s) => s.status === "active").length,
    totalLessons: (lessons ?? []).length,
    teachers,
  };
}
