"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, MoveHorizontal, Trash2, Clock, CheckCircle2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { WEEK_DAYS } from "@/lib/validation/student";
import { clearSchedulePreference } from "@/actions/students";
import { ensureLessonForDate, markLessonCompleted } from "@/actions/lessons";
import { lessonStatusRowClass } from "@/lib/lesson-style";
import { getCurrentWeekStart, dateForSlot, todayLetter, isSameDay } from "@/lib/schedule-week";
import { EditSlotDialog } from "./edit-slot-dialog";
import { MarkPaidDialog } from "@/components/lessons/mark-paid-dialog";
import type { Lesson, LessonStatus, Student } from "@/types/database";

const STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled_in_time: "בוטל בזמן",
  cancelled_late: "בוטל באיחור",
};

interface DaySlot {
  student: Student;
  date: Date;
  lesson: Lesson | null;
}

export function WeeklyScheduleGrid({
  students,
  weekLessons,
}: {
  students: Student[];
  weekLessons: Lesson[];
}) {
  const router = useRouter();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [removingStudent, setRemovingStudent] = useState<Student | null>(null);
  const [payingSlot, setPayingSlot] = useState<{ lessonId: string; studentId: string } | null>(
    null
  );
  const [busySlot, setBusySlot] = useState<string | null>(null);

  const weekStart = getCurrentWeekStart();
  const today = todayLetter();

  const slotsByDay: Record<string, DaySlot[]> = Object.fromEntries(
    WEEK_DAYS.map((day) => {
      const slots = students
        .filter((s) => s.preferred_learning_day.includes(day))
        .map((student) => {
          const date = dateForSlot(weekStart, day, student.preferred_learning_time);
          const lesson =
            weekLessons.find(
              (l) => l.student_id === student.id && isSameDay(new Date(l.date_time), date)
            ) ?? null;
          return { student, date, lesson };
        })
        .sort((a, b) => (a.student.preferred_learning_time ?? "").localeCompare(
          b.student.preferred_learning_time ?? ""
        ));
      return [day, slots];
    })
  );

  async function removeFromSchedule(student: Student) {
    try {
      await clearSchedulePreference(student.id);
      toast.success(`${student.student_name} הוסר/ה ממערכת השעות`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setRemovingStudent(null);
    }
  }

  async function markSlotCompleted(slot: DaySlot) {
    setBusySlot(slot.student.id);
    try {
      const lessonId = await ensureLessonForDate(
        slot.student.id,
        slot.date.toISOString(),
        slot.student.hourly_rate
      );
      await markLessonCompleted(lessonId, slot.student.id);
      toast.success("השיעור סומן כהושלם");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusySlot(null);
    }
  }

  async function markSlotPaid(slot: DaySlot) {
    setBusySlot(slot.student.id);
    try {
      const lessonId = await ensureLessonForDate(
        slot.student.id,
        slot.date.toISOString(),
        slot.student.hourly_rate
      );
      await markLessonCompleted(lessonId, slot.student.id);
      setPayingSlot({ lessonId, studentId: slot.student.id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusySlot(null);
    }
  }

  const hasAnySlots = students.some((s) => s.preferred_learning_day.length > 0);

  if (!hasAnySlots) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        אין עדיין תלמידים עם יום/שעה מועדפים מוגדרים. ניתן להגדיר זאת בעריכת תלמיד/ה.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {WEEK_DAYS.map((day) => {
          const isToday = day === today;
          return (
            <Card
              key={day}
              className={cn(
                isToday && "border-primary bg-primary/5 ring-1 ring-primary/40"
              )}
            >
              <CardHeader>
                <CardTitle
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-base",
                    isToday && "text-primary"
                  )}
                >
                  יום {day}
                  {isToday && <Badge className="text-[10px]">היום</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {slotsByDay[day].length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">אין שיעורים</p>
                )}
                {slotsByDay[day].map((slot) => {
                  const { student, lesson } = slot;
                  const isBusy = busySlot === student.id;
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border p-2",
                        lesson && lessonStatusRowClass(lesson.status)
                      )}
                    >
                      <div>
                        <Link
                          href={`/students/${student.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {student.student_name}
                        </Link>
                        {student.preferred_learning_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {student.preferred_learning_time}
                          </div>
                        )}
                        {lesson && (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {STATUS_LABEL[lesson.status]}
                            {lesson.is_paid ? " · שולם" : ""}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              disabled={isBusy}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {lesson?.status !== "completed" && (
                            <DropdownMenuItem onClick={() => markSlotCompleted(slot)}>
                              <CheckCircle2 className="size-4" />
                              סימון כהושלם
                            </DropdownMenuItem>
                          )}
                          {!lesson?.is_paid && (
                            <DropdownMenuItem onClick={() => markSlotPaid(slot)}>
                              <Wallet className="size-4" />
                              סימון כשולם
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                            <MoveHorizontal className="size-4" />
                            הזזה / שינוי
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRemovingStudent(student)}>
                            <Trash2 className="size-4" />
                            הסרה ממערכת השעות
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingStudent && (
        <EditSlotDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />
      )}

      {payingSlot && (
        <MarkPaidDialog
          lessonId={payingSlot.lessonId}
          studentId={payingSlot.studentId}
          open={!!payingSlot}
          onOpenChange={(open) => !open && setPayingSlot(null)}
        />
      )}

      <AlertDialog open={!!removingStudent} onOpenChange={(open) => !open && setRemovingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>להסיר ממערכת השעות?</AlertDialogTitle>
            <AlertDialogDescription>
              {removingStudent?.student_name} יוסר/תוסר מכל הימים במערכת השעות השבועית. פרטי
              התלמיד/ה עצמם לא יימחקו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => removingStudent && removeFromSchedule(removingStudent)}>
              הסרה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
