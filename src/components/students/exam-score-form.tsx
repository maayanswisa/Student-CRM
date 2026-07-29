"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  examScoreSchema,
  type ExamScoreFormValues,
  type ExamScoreFormInput,
} from "@/lib/validation/exam-score";
import { createExamScore, updateExamScore } from "@/actions/exam-scores";
import type { ExamScore } from "@/types/database";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExamScoreFormDialog({
  studentId,
  examScore,
  open,
  onOpenChange,
}: {
  studentId: string;
  examScore?: ExamScore;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const values = useMemo(
    () => ({
      exam_date: examScore?.exam_date ?? today(),
      subject: examScore?.subject ?? "",
      score: examScore?.score ?? 0,
      notes: examScore?.notes ?? "",
    }),
    [examScore]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamScoreFormInput, unknown, ExamScoreFormValues>({
    resolver: zodResolver(examScoreSchema),
    values,
  });

  async function onSubmit(values: ExamScoreFormValues) {
    setSubmitting(true);
    try {
      if (examScore) {
        await updateExamScore(examScore.id, studentId, values);
        toast.success("הציון עודכן");
      } else {
        await createExamScore(studentId, values);
        toast.success("הציון נוסף");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{examScore ? "עריכת ציון" : "הוספת ציון"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="exam_date">תאריך</FieldLabel>
                <Input id="exam_date" type="date" {...register("exam_date")} />
                {errors.exam_date && <FieldError>{errors.exam_date.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="score">ציון</FieldLabel>
                <Input id="score" type="number" step="0.5" {...register("score")} />
                {errors.score && <FieldError>{errors.score.message}</FieldError>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="subject">נושא / מקצוע</FieldLabel>
              <Input id="subject" placeholder="לדוגמה: טריגונומטריה" {...register("subject")} />
              {errors.subject && <FieldError>{errors.subject.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">הערות</FieldLabel>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "שומר..." : "שמירה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
