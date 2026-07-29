"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { examScoreSchema, type ExamScoreFormValues } from "@/lib/validation/exam-score";

export async function createExamScore(studentId: string, values: ExamScoreFormValues) {
  const parsed = examScoreSchema.parse(values);
  const supabase = await createClient();
  const { error } = await supabase.from("exam_scores").insert({
    student_id: studentId,
    exam_date: parsed.exam_date,
    subject: parsed.subject,
    score: parsed.score,
    notes: parsed.notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${studentId}`);
}

export async function updateExamScore(
  id: string,
  studentId: string,
  values: ExamScoreFormValues
) {
  const parsed = examScoreSchema.parse(values);
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_scores")
    .update({
      exam_date: parsed.exam_date,
      subject: parsed.subject,
      score: parsed.score,
      notes: parsed.notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${studentId}`);
}

export async function deleteExamScore(id: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exam_scores").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/students/${studentId}`);
}
