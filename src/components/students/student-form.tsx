"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  studentSchema,
  type StudentFormValues,
  type StudentFormInput,
  GRADES,
  ACADEMIC_LEVELS,
  WEEK_DAYS,
} from "@/lib/validation/student";
import { createStudent, updateStudent } from "@/actions/students";
import type { Student } from "@/types/database";

const emptyValues: StudentFormInput = {
  student_name: "",
  mother_name: "",
  student_phone: "",
  mother_phone: "",
  address: "",
  grade: GRADES[0],
  academic_level: ACADEMIC_LEVELS[0],
  school: "",
  hourly_rate: 0,
  preferred_learning_day: [],
  preferred_learning_time: "",
  status: "active",
  notes: "",
  upcoming_exam_date: "",
};

function studentToValues(student: Student): StudentFormInput {
  return {
    student_name: student.student_name,
    mother_name: student.mother_name,
    student_phone: student.student_phone ?? "",
    mother_phone: student.mother_phone,
    address: student.address,
    grade: student.grade,
    academic_level: student.academic_level,
    school: student.school,
    hourly_rate: student.hourly_rate,
    preferred_learning_day: student.preferred_learning_day,
    preferred_learning_time: student.preferred_learning_time ?? "",
    status: student.status,
    notes: student.notes ?? "",
    upcoming_exam_date: student.upcoming_exam_date ?? "",
  };
}

export function StudentFormDialog({
  student,
  open,
  onOpenChange,
}: {
  student?: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentSchema),
    values: student ? studentToValues(student) : emptyValues,
  });

  async function onSubmit(values: StudentFormValues) {
    setSubmitting(true);
    try {
      if (student) {
        await updateStudent(student.id, values);
        toast.success("פרטי התלמיד/ה עודכנו");
      } else {
        await createStudent(values);
        toast.success("התלמיד/ה נוסף/ה בהצלחה");
        reset(emptyValues);
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "עריכת תלמיד/ה" : "תלמיד/ה חדש/ה"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="student_name">שם התלמיד/ה</FieldLabel>
                <Input id="student_name" {...register("student_name")} />
                {errors.student_name && <FieldError>{errors.student_name.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="mother_name">שם ההורה</FieldLabel>
                <Input id="mother_name" {...register("mother_name")} />
                {errors.mother_name && <FieldError>{errors.mother_name.message}</FieldError>}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="student_phone">טלפון התלמיד/ה (לא חובה)</FieldLabel>
                <Input id="student_phone" {...register("student_phone")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="mother_phone">טלפון ההורה</FieldLabel>
                <Input id="mother_phone" {...register("mother_phone")} />
                {errors.mother_phone && <FieldError>{errors.mother_phone.message}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">כתובת</FieldLabel>
              <Input id="address" {...register("address")} />
              {errors.address && <FieldError>{errors.address.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field>
                <FieldLabel htmlFor="grade">כיתה</FieldLabel>
                <Controller
                  control={control}
                  name="grade"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="grade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="academic_level">רמת לימוד</FieldLabel>
                <Controller
                  control={control}
                  name="academic_level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="academic_level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_LEVELS.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="school">בית ספר</FieldLabel>
                <Input id="school" {...register("school")} />
                {errors.school && <FieldError>{errors.school.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="hourly_rate">מחיר לשיעור (ש&quot;ח)</FieldLabel>
                <Input id="hourly_rate" type="number" step="0.5" {...register("hourly_rate")} />
                {errors.hourly_rate && <FieldError>{errors.hourly_rate.message}</FieldError>}
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">ימי לימוד מועדפים</FieldLegend>
              <Controller
                control={control}
                name="preferred_learning_day"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const active = field.value.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              active
                                ? field.value.filter((d) => d !== day)
                                : [...field.value, day]
                            )
                          }
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-sm",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </FieldSet>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="preferred_learning_time">שעה מועדפת</FieldLabel>
                <Input id="preferred_learning_time" placeholder="16:00" {...register("preferred_learning_time")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="upcoming_exam_date">תאריך מבחן קרוב</FieldLabel>
                <Input id="upcoming_exam_date" type="date" {...register("upcoming_exam_date")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="status">סטטוס</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל/ה</SelectItem>
                      <SelectItem value="paused">בהפסקה</SelectItem>
                      <SelectItem value="archived">בארכיון</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">נקודות חולשה / הערות</FieldLabel>
              <Textarea id="notes" rows={3} {...register("notes")} />
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
