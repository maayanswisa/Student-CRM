"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { MoreVertical, MoveHorizontal, Trash2, Clock } from "lucide-react";
import { WEEK_DAYS } from "@/lib/validation/student";
import { clearSchedulePreference } from "@/actions/students";
import { EditSlotDialog } from "./edit-slot-dialog";
import type { Student } from "@/types/database";

interface DaySlot {
  student: Student;
}

export function WeeklyScheduleGrid({ students }: { students: Student[] }) {
  const router = useRouter();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [removingStudent, setRemovingStudent] = useState<Student | null>(null);

  const slotsByDay: Record<string, DaySlot[]> = Object.fromEntries(
    WEEK_DAYS.map((day) => [
      day,
      students
        .filter((s) => s.preferred_learning_day.includes(day))
        .map((student) => ({ student }))
        .sort((a, b) =>
          (a.student.preferred_learning_time ?? "").localeCompare(
            b.student.preferred_learning_time ?? ""
          )
        ),
    ])
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
        {WEEK_DAYS.map((day) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-center text-base">יום {day}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {slotsByDay[day].length === 0 && (
                <p className="text-center text-xs text-muted-foreground">אין שיעורים</p>
              )}
              {slotsByDay[day].map(({ student }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2"
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
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
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
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingStudent && (
        <EditSlotDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
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
