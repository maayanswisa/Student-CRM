"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lessonSchema, type LessonFormValues } from "@/lib/validation/lesson";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import type { PaymentMethod } from "@/types/database";

export async function getLessonsExportRows() {
  const supabase = await createClient();
  const [{ data: lessons }, { data: students }] = await Promise.all([
    supabase.from("lessons").select("*").order("date_time", { ascending: false }),
    supabase.from("students").select("id, student_name"),
  ]);

  const nameById = new Map((students ?? []).map((s) => [s.id, s.student_name]));

  return (lessons ?? []).map((lesson) => ({
    תאריך: new Date(lesson.date_time).toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    "תלמיד/ה": nameById.get(lesson.student_id) ?? "לא ידוע",
    "משך (דקות)": lesson.duration_minutes,
    "מחיר (ש\"ח)": Number(lesson.price),
    שולם: lesson.is_paid ? "כן" : "לא",
    "אמצעי תשלום": lesson.payment_method ? PAYMENT_METHOD_LABELS[lesson.payment_method] ?? "" : "",
    "תאריך תשלום": lesson.payment_date
      ? new Date(lesson.payment_date).toLocaleDateString("he-IL")
      : "",
  }));
}

function revalidateLessonPaths(studentId?: string) {
  revalidatePath("/");
  revalidatePath("/lessons");
  revalidatePath("/schedule");
  if (studentId) revalidatePath(`/students/${studentId}`);
}

export async function createLesson(values: LessonFormValues) {
  const parsed = lessonSchema.parse(values);
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("lessons")
    .insert({
      student_id: parsed.student_id,
      date_time: parsed.date_time,
      duration_minutes: parsed.duration_minutes,
      price: parsed.price,
      lesson_summary: parsed.lesson_summary || null,
      status: "scheduled",
      is_paid: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidateLessonPaths(parsed.student_id);
  return data;
}

export async function updateLesson(
  id: string,
  studentId: string,
  values: LessonFormValues
) {
  const parsed = lessonSchema.parse(values);
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      date_time: parsed.date_time,
      duration_minutes: parsed.duration_minutes,
      price: parsed.price,
      lesson_summary: parsed.lesson_summary || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateLessonPaths(studentId);
}

export async function markLessonCompleted(id: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function cancelLesson(
  id: string,
  studentId: string,
  timing: "in_time" | "late"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ status: timing === "in_time" ? "cancelled_in_time" : "cancelled_late" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function markLessonPaid(
  id: string,
  studentId: string,
  paymentMethod: PaymentMethod
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      is_paid: true,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function markLessonUnpaid(id: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ is_paid: false, payment_method: null, payment_date: null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function deleteLesson(id: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function logCompletedLesson(params: {
  studentId: string;
  price: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
}) {
  const { studentId, price, paid, paymentMethod } = params;
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    date_time: new Date().toISOString(),
    duration_minutes: 60,
    price,
    status: "completed",
    is_paid: paid,
    payment_method: paid ? paymentMethod ?? null : null,
    payment_date: paid ? new Date().toISOString() : null,
  });

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}

export async function ensureLessonForDate(
  studentId: string,
  dateIso: string,
  price: number
): Promise<string> {
  const supabase = await createClient();
  const day = new Date(dateIso);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: existing } = await supabase
    .from("lessons")
    .select("id")
    .eq("student_id", studentId)
    .gte("date_time", dayStart.toISOString())
    .lte("date_time", dayEnd.toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      student_id: studentId,
      date_time: dateIso,
      duration_minutes: 60,
      price,
      status: "scheduled",
      is_paid: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidateLessonPaths(studentId);
  return data.id;
}

export async function updateLessonSummary(
  id: string,
  studentId: string,
  summary: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ lesson_summary: summary })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLessonPaths(studentId);
}
