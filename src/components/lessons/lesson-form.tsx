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
  lessonSchema,
  type LessonFormValues,
  type LessonFormInput,
} from "@/lib/validation/lesson";
import { createLesson, updateLesson } from "@/actions/lessons";
import type { Lesson } from "@/types/database";

function toDateTimeLocal(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function LessonFormDialog({
  studentId,
  studentName,
  hourlyRate,
  lesson,
  open,
  onOpenChange,
}: {
  studentId: string;
  studentName: string;
  hourlyRate: number;
  lesson?: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const values = useMemo(
    () => ({
      student_id: studentId,
      date_time: toDateTimeLocal(lesson?.date_time),
      duration_minutes: lesson?.duration_minutes ?? 60,
      price: lesson?.price ?? hourlyRate,
      lesson_summary: lesson?.lesson_summary ?? "",
    }),
    [studentId, lesson, hourlyRate]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormInput, unknown, LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    values,
  });

  async function onSubmit(values: LessonFormValues) {
    setSubmitting(true);
    try {
      const isoDateTime = new Date(values.date_time).toISOString();
      if (lesson) {
        await updateLesson(lesson.id, studentId, { ...values, date_time: isoDateTime });
        toast.success("השיעור עודכן");
      } else {
        await createLesson({ ...values, date_time: isoDateTime });
        toast.success("השיעור נקבע");
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
          <DialogTitle>{lesson ? "עריכת שיעור" : `קביעת שיעור ל${studentName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date_time">תאריך ושעה</FieldLabel>
              <Input id="date_time" type="datetime-local" {...register("date_time")} />
              {errors.date_time && <FieldError>{errors.date_time.message}</FieldError>}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="duration_minutes">משך (דקות)</FieldLabel>
                <Input id="duration_minutes" type="number" step="15" {...register("duration_minutes")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="price">מחיר (ש&quot;ח)</FieldLabel>
                <Input id="price" type="number" step="0.5" {...register("price")} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="lesson_summary">סיכום שיעור / שיעורי בית</FieldLabel>
              <Textarea id="lesson_summary" rows={3} {...register("lesson_summary")} />
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
