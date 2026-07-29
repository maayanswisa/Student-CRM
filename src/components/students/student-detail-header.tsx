"use client";

import { useState } from "react";
import { Phone, MessageCircle, Plus, CalendarClock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LessonFormDialog } from "@/components/lessons/lesson-form";
import { StudentFormDialog } from "@/components/students/student-form";
import { StudentAvatar } from "@/components/students/student-avatar";
import { buildPaymentReminderLink } from "@/lib/whatsapp";
import type { Student } from "@/types/database";
import type { StudentDebt } from "@/lib/debt";

const STATUS_LABEL: Record<Student["status"], string> = {
  active: "פעיל/ה",
  paused: "בהפסקה",
  archived: "בארכיון",
};

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "972")}`;
}

export function StudentDetailHeader({
  student,
  debt,
}: {
  student: Student;
  debt: StudentDebt;
}) {
  const [scheduling, setScheduling] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <StudentAvatar name={student.student_name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{student.student_name}</h1>
                <Badge variant="outline">{STATUS_LABEL[student.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                כיתה {student.grade} · {student.academic_level} · {student.school}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              עריכה
            </Button>
            <Button onClick={() => setScheduling(true)}>
              <Plus className="size-4" />
              קביעת שיעור
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{student.mother_name} (הורה)</p>
              <p className="text-xs text-muted-foreground">{student.mother_phone}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                nativeButton={false}
                render={
                  <a href={`tel:${student.mother_phone}`}>
                    <Phone className="size-4" />
                  </a>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                nativeButton={false}
                render={
                  <a href={waLink(student.mother_phone)} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                  </a>
                }
              />
            </div>
          </div>

          {student.student_phone && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{student.student_name} (תלמיד/ה)</p>
                <p className="text-xs text-muted-foreground">{student.student_phone}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={
                    <a href={`tel:${student.student_phone}`}>
                      <Phone className="size-4" />
                    </a>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={
                    <a href={waLink(student.student_phone)} target="_blank" rel="noreferrer">
                      <MessageCircle className="size-4" />
                    </a>
                  }
                />
              </div>
            </div>
          )}
        </div>

        {student.upcoming_exam_date && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
            <CalendarClock className="size-4 text-muted-foreground" />
            מבחן קרוב:{" "}
            {new Date(student.upcoming_exam_date).toLocaleDateString("he-IL")}
          </div>
        )}

        {student.notes && (
          <div className="rounded-lg border p-3 text-sm">
            <p className="mb-1 font-medium">נקודות חולשה / הערות</p>
            <p className="whitespace-pre-wrap text-muted-foreground">{student.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">חוב מצטבר</p>
            <p className="text-lg font-semibold">{debt.totalOwed.toFixed(2)} ₪</p>
            <p className="text-xs text-muted-foreground">{debt.unpaidCount} שיעורים שלא שולמו</p>
          </div>
          {debt.totalOwed > 0 && (
            <Button
              variant="secondary"
              nativeButton={false}
              render={
                <a
                  href={buildPaymentReminderLink({
                    phone: student.mother_phone,
                    studentName: student.student_name,
                    unpaidCount: debt.unpaidCount,
                    totalOwed: debt.totalOwed,
                  })}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  שליחת תזכורת תשלום
                </a>
              }
            />
          )}
        </div>
      </CardContent>

      <LessonFormDialog
        studentId={student.id}
        studentName={student.student_name}
        hourlyRate={student.hourly_rate}
        open={scheduling}
        onOpenChange={setScheduling}
      />

      <StudentFormDialog student={student} open={editing} onOpenChange={setEditing} />
    </Card>
  );
}
