"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { WEEK_DAYS } from "@/lib/validation/student";
import { updateSchedulePreference } from "@/actions/students";
import type { Student } from "@/types/database";

export function EditSlotDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [days, setDays] = useState<string[]>(student.preferred_learning_day);
  const [time, setTime] = useState(student.preferred_learning_time ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    setSubmitting(true);
    try {
      await updateSchedulePreference(student.id, days, time);
      toast.success("מערכת השעות עודכנה");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDays(student.preferred_learning_day);
          setTime(student.preferred_learning_time ?? "");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>הזזת שיעור - {student.student_name}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">ימי לימוד</FieldLegend>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setDays(active ? days.filter((d) => d !== day) : [...days, day])
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
          </FieldSet>
          <Field>
            <FieldLabel htmlFor="slot-time">שעה</FieldLabel>
            <Input
              id="slot-time"
              placeholder="16:00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter className="mt-4">
          <Button onClick={save} disabled={submitting}>
            {submitting ? "שומר..." : "שמירה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
