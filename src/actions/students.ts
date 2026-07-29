"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { studentSchema, type StudentFormValues } from "@/lib/validation/student";
import type { StudentStatus } from "@/types/database";

function toRow(values: StudentFormValues) {
  const parsed = studentSchema.parse(values);
  return {
    student_name: parsed.student_name,
    mother_name: parsed.mother_name,
    student_phone: parsed.student_phone || null,
    mother_phone: parsed.mother_phone,
    address: parsed.address,
    grade: parsed.grade,
    academic_level: parsed.academic_level,
    school: parsed.school,
    hourly_rate: parsed.hourly_rate,
    preferred_learning_day: parsed.preferred_learning_day,
    preferred_learning_time: parsed.preferred_learning_time || null,
    status: parsed.status,
    notes: parsed.notes || null,
    upcoming_exam_date: parsed.upcoming_exam_date || null,
  };
}

export async function createStudent(values: StudentFormValues) {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("students")
    .insert(toRow(values))
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/students");
  revalidatePath("/");
  return data;
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

export async function updateSchedulePreference(
  id: string,
  days: string[],
  time: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      preferred_learning_day: days,
      preferred_learning_time: time || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/schedule");
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function clearSchedulePreference(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ preferred_learning_day: [], preferred_learning_time: null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/schedule");
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}
