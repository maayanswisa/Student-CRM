"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lessonSchema, type LessonFormValues } from "@/lib/validation/lesson";
import { PAYMENT_METHOD_LABELS, WEEK_DAYS } from "@/lib/validation/student";
import type { PaymentMethod } from "@/types/database";

function combineDateAndTime(date: Date, time: string | null): Date {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    if (!Number.isNaN(h)) {
      d.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
      return d;
    }
  }
  d.setHours(12, 0, 0, 0);
  return d;
}

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
  revalidatePath("/calendar");
  if (studentId) revalidatePath(`/students/${studentId}`);
}

export interface LessonConflict {
  studentName: string;
  time: string;
}

export async function checkLessonConflict(
  dateTime: string,
  durationMinutes: number,
  excludeLessonId?: string,
  forStudentId?: string
): Promise<LessonConflict | null> {
  const supabase = await createClient();
  const target = new Date(dateTime);
  const start = target.getTime();
  const end = start + durationMinutes * 60000;

  const dayStart = new Date(dateTime);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateTime);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: dayLessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, student_id, date_time, duration_minutes, status")
    .gte("date_time", dayStart.toISOString())
    .lte("date_time", dayEnd.toISOString());

  if (lessonsError) throw new Error(lessonsError.message);

  const lessonConflict = (dayLessons ?? []).find((lesson) => {
    if (lesson.id === excludeLessonId) return false;
    if (lesson.status === "cancelled_in_time" || lesson.status === "cancelled_late") return false;
    const lStart = new Date(lesson.date_time).getTime();
    const lEnd = lStart + lesson.duration_minutes * 60000;
    return lStart < end && lEnd > start;
  });

  if (lessonConflict) {
    const { data: student } = await supabase
      .from("students")
      .select("student_name")
      .eq("id", lessonConflict.student_id)
      .single();

    return {
      studentName: student?.student_name ?? "תלמיד/ה אחר/ת",
      time: new Date(lessonConflict.date_time).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  // Also check recurring weekly-schedule slots that don't have a real lesson row
  // yet (shown as dashed placeholders in the calendar) - they still occupy time.
  const scheduledStudentIds = new Set((dayLessons ?? []).map((l) => l.student_id));
  const dayLetter = WEEK_DAYS[target.getDay()];

  const { data: recurringStudents, error: studentsError } = await supabase
    .from("students")
    .select("id, student_name, preferred_learning_day, preferred_learning_time, default_lesson_duration_minutes")
    .eq("status", "active")
    .contains("preferred_learning_day", [dayLetter]);

  if (studentsError) throw new Error(studentsError.message);

  const recurringConflict = (recurringStudents ?? []).find((s) => {
    if (s.id === forStudentId) return false;
    if (scheduledStudentIds.has(s.id)) return false;
    const rStart = combineDateAndTime(target, s.preferred_learning_time).getTime();
    const rEnd = rStart + s.default_lesson_duration_minutes * 60000;
    return rStart < end && rEnd > start;
  });

  if (!recurringConflict) return null;

  return {
    studentName: recurringConflict.student_name,
    time: recurringConflict.preferred_learning_time ?? "לפי מערכת שעות",
  };
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
  price: number,
  durationMinutes = 60
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
      duration_minutes: durationMinutes,
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
