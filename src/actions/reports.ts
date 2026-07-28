"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReportRow {
  date: string;
  studentName: string;
  price: number;
  status: string;
  isPaid: boolean;
  paymentMethod: string | null;
}

export async function getMonthlyReport(month: string): Promise<ReportRow[]> {
  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);

  const supabase = await createClient();
  const [{ data: lessons }, { data: students }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .gte("date_time", start.toISOString())
      .lt("date_time", end.toISOString())
      .order("date_time"),
    supabase.from("students").select("id, student_name"),
  ]);

  const nameById = new Map((students ?? []).map((s) => [s.id, s.student_name]));

  return (lessons ?? []).map((lesson) => ({
    date: lesson.date_time,
    studentName: nameById.get(lesson.student_id) ?? "לא ידוע",
    price: Number(lesson.price),
    status: lesson.status,
    isPaid: lesson.is_paid,
    paymentMethod: lesson.payment_method,
  }));
}
