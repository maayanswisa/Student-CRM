"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  studentSchema,
  type StudentFormValues,
  type StudentFormInput,
} from "@/lib/validation/student";
import type { StudentStatus } from "@/types/database";

const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "פעיל/ה",
  paused: "בהפסקה",
  archived: "בארכיון",
};

function toMinutes(time: string): number | null {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

export interface ScheduleConflict {
  studentName: string;
  day: string;
  time: string;
}

export async function checkScheduleConflict(
  days: string[],
  time: string,
  durationMinutes: number,
  excludeStudentId?: string
): Promise<ScheduleConflict | null> {
  if (!time || days.length === 0) return null;
  const startMinutes = toMinutes(time);
  if (startMinutes === null) return null;
  const endMinutes = startMinutes + durationMinutes;

  const supabase = await createClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("id, student_name, preferred_learning_day, preferred_learning_time, default_lesson_duration_minutes")
    .eq("status", "active");

  if (error) throw new Error(error.message);

  for (const day of days) {
    const conflict = (students ?? []).find((s) => {
      if (s.id === excludeStudentId) return false;
      if (!s.preferred_learning_day.includes(day)) return false;
      if (!s.preferred_learning_time) return false;
      const oStart = toMinutes(s.preferred_learning_time);
      if (oStart === null) return false;
      const oEnd = oStart + s.default_lesson_duration_minutes;
      return oStart < endMinutes && oEnd > startMinutes;
    });
    if (conflict) {
      return {
        studentName: conflict.student_name,
        day,
        time: conflict.preferred_learning_time as string,
      };
    }
  }

  return null;
}

export async function getStudentsExportRows() {
  const supabase = await createClient();
  const [{ data: students }, { data: lessons }] = await Promise.all([
    supabase.from("students").select("*").order("student_name"),
    supabase.from("lessons").select("student_id, status, is_paid, price"),
  ]);

  const debtByStudent = new Map<string, number>();
  for (const lesson of lessons ?? []) {
    if (lesson.status === "completed" && !lesson.is_paid) {
      debtByStudent.set(
        lesson.student_id,
        (debtByStudent.get(lesson.student_id) ?? 0) + Number(lesson.price)
      );
    }
  }

  return (students ?? []).map((s) => ({
    "שם התלמיד/ה": s.student_name,
    "שם ההורה": s.mother_name,
    "טלפון ההורה": s.mother_phone,
    "טלפון התלמיד/ה": s.student_phone ?? "",
    כתובת: s.address,
    כיתה: s.grade,
    "רמת לימוד": s.academic_level,
    "בית ספר": s.school,
    "מחיר לשיעור (ש\"ח)": s.hourly_rate,
    "ימי לימוד מועדפים": s.preferred_learning_day.join(", "),
    "שעה מועדפת": s.preferred_learning_time ?? "",
    סטטוס: STATUS_LABELS[s.status] ?? s.status,
    "חוב כולל (ש\"ח)": debtByStudent.get(s.id) ?? 0,
    הערות: s.notes ?? "",
  }));
}

function toRow(values: StudentFormInput) {
  const parsed = studentSchema.parse(values);
  return {
    student_name: parsed.student_name,
    mother_name: parsed.mother_name || "",
    student_phone: parsed.student_phone || null,
    mother_phone: parsed.mother_phone || "",
    address: parsed.address || "",
    entrance: parsed.entrance || null,
    entry_code: parsed.entry_code || null,
    floor: parsed.floor || null,
    apartment_number: parsed.apartment_number || null,
    grade: parsed.grade || "",
    academic_level: parsed.academic_level || "",
    school: parsed.school || "",
    hourly_rate: parsed.hourly_rate,
    default_lesson_duration_minutes: parsed.default_lesson_duration_minutes,
    preferred_learning_day: parsed.preferred_learning_day,
    preferred_learning_time: parsed.preferred_learning_time || null,
    status: parsed.status,
    notes: parsed.notes || null,
    upcoming_exam_date: parsed.upcoming_exam_date || null,
  };
}

async function nextSortOrder(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("students")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

export async function bulkCreateStudents(rows: StudentFormInput[]) {
  const validRows: ReturnType<typeof toRow>[] = [];
  let skipped = 0;

  for (const row of rows) {
    try {
      validRows.push(toRow(row));
    } catch {
      skipped += 1;
    }
  }

  if (validRows.length === 0) {
    return { inserted: 0, skipped };
  }

  const supabase = await createClient();
  let nextOrder = await nextSortOrder(supabase);
  const rowsWithOrder = validRows.map((row) => ({ ...row, sort_order: nextOrder++ }));
  const { error, data } = await supabase.from("students").insert(rowsWithOrder).select("id");

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  revalidatePath("/");
  return { inserted: data?.length ?? 0, skipped };
}

export async function createStudent(values: StudentFormValues) {
  const supabase = await createClient();
  const sort_order = await nextSortOrder(supabase);
  const { error, data } = await supabase
    .from("students")
    .insert({ ...toRow(values), sort_order })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  revalidatePath("/");
  return data;
}

export async function reorderStudents(orderedIds: string[]) {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("students").update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  revalidatePath("/students");
}

export async function updateStudent(id: string, values: StudentFormValues) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update(toRow(values))
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  revalidatePath("/");
}

export async function setStudentStatus(id: string, status: StudentStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  revalidatePath("/");
}

