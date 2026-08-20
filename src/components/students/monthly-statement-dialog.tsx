"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { buildMonthlyStatementLink } from "@/lib/whatsapp";
import { useSessionLabel } from "@/components/providers/session-label-provider";
import type { Lesson } from "@/types/database";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthlyStatementDialog({
  studentName,
  motherPhone,
  lessons,
  totalOwed,
  open,
  onOpenChange,
}: {
  studentName: string;
  motherPhone: string;
  lessons: Lesson[];
  totalOwed: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sessionLabel = useSessionLabel();
  const [month, setMonth] = useState(currentMonth());

  const monthLessons = useMemo(() => {
    const [year, monthNum] = month.split("-").map(Number);
    return lessons
      .filter((lesson) => {
        if (lesson.status !== "completed") return false;
        const dt = new Date(lesson.date_time);
        return dt.getFullYear() === year && dt.getMonth() === monthNum - 1;
      })
      .sort((a, b) => a.date_time.localeCompare(b.date_time))
      .map((lesson) => ({
        dateTime: lesson.date_time,
        price: Number(lesson.price),
        isPaid: lesson.is_paid,
      }));
  }, [lessons, month]);

  const monthLabel = useMemo(() => {
    const [year, monthNum] = month.split("-").map(Number);
    return new Date(year, monthNum - 1, 1).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
    });
  }, [month]);

  const link = buildMonthlyStatementLink({
    phone: motherPhone,
    studentName,
    monthLabel,
    lessons: monthLessons,
    totalOwed,
    sessionLabel,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הפקת דוח חודשי</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="statement-month">חודש</FieldLabel>
          <Input
            id="statement-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Field>
        <div className="rounded-lg border p-3 text-sm">
          <p className="mb-1 font-medium">
            {monthLessons.length} {sessionLabel.plural} שהושלמו ב{monthLabel}
          </p>
          <p className="text-muted-foreground">סה&quot;כ יתרה לתשלום: {totalOwed.toFixed(2)} ש&quot;ח</p>
        </div>
        <DialogFooter>
          <Button
            nativeButton={false}
            render={
              <a href={link} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                שליחה בוואטסאפ
              </a>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
