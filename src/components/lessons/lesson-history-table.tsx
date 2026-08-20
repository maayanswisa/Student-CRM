"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { MoreVertical, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import {
  markLessonCompleted,
  markLessonUnpaid,
  cancelLesson,
  deleteLesson,
} from "@/actions/lessons";
import { MarkPaidDialog } from "./mark-paid-dialog";
import { LessonFormDialog } from "./lesson-form";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import { lessonStatusRowClass, lessonStatusLabel } from "@/lib/lesson-style";
import { cn } from "@/lib/utils";
import type { Lesson, LessonStatus } from "@/types/database";

const STATUS_VARIANT: Record<LessonStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "secondary",
  completed: "default",
  cancelled_in_time: "outline",
  cancelled_late: "destructive",
};

export function LessonHistoryTable({
  lessons,
  studentId,
  studentName,
  hourlyRate,
}: {
  lessons: Lesson[];
  studentId: string;
  studentName: string;
  hourlyRate: number;
}) {
  const router = useRouter();
  const [payingLessonId, setPayingLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  async function togglePaid(lesson: Lesson) {
    if (lesson.is_paid) {
      try {
        await markLessonUnpaid(lesson.id, studentId);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "משהו השתבש");
      }
    } else {
      setPayingLessonId(lesson.id);
    }
  }

  async function complete(lesson: Lesson) {
    try {
      await markLessonCompleted(lesson.id, studentId);
      toast.success("השיעור סומן כהושלם");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function cancel(lesson: Lesson, timing: "in_time" | "late") {
    try {
      await cancelLesson(lesson.id, studentId, timing);
      toast.success("השיעור בוטל");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function remove(lesson: Lesson) {
    try {
      await deleteLesson(lesson.id, studentId);
      toast.success("השיעור נמחק");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setDeletingLesson(null);
    }
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        אין עדיין שיעורים
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תאריך</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>שולם</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id} className={cn(lessonStatusRowClass(lesson))}>
                <TableCell>
                  {new Date(lesson.date_time).toLocaleString("he-IL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>{Number(lesson.price).toFixed(2)} ₪</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[lesson.status]}>
                    {lessonStatusLabel(lesson)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={lesson.is_paid}
                      disabled={lesson.status !== "completed"}
                      onCheckedChange={() => togglePaid(lesson)}
                    />
                    {lesson.is_paid && lesson.payment_method && (
                      <span className="text-xs text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[lesson.payment_method]}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingLesson(lesson)}>
                        <Pencil className="size-4" />
                        עריכה / הוספת פתק
                      </DropdownMenuItem>
                      {lesson.status !== "completed" && (
                        <DropdownMenuItem onClick={() => complete(lesson)}>
                          <CheckCircle2 className="size-4" />
                          סימון כהושלם
                        </DropdownMenuItem>
                      )}
                      {lesson.status !== "cancelled_in_time" && (
                        <DropdownMenuItem onClick={() => cancel(lesson, "in_time")}>
                          <XCircle className="size-4" />
                          ביטול בזמן
                        </DropdownMenuItem>
                      )}
                      {lesson.status !== "cancelled_late" && (
                        <DropdownMenuItem onClick={() => cancel(lesson, "late")}>
                          <XCircle className="size-4" />
                          ביטול באיחור
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingLesson(lesson)}
                      >
                        <Trash2 className="size-4" />
                        מחיקת שיעור
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingLesson} onOpenChange={(open) => !open && setDeletingLesson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את השיעור?</AlertDialogTitle>
            <AlertDialogDescription>
              הפעולה בלתי הפיכה - השיעור יימחק לצמיתות מההיסטוריה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingLesson && remove(deletingLesson)}>
              מחיקה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {payingLessonId && (
        <MarkPaidDialog
          lessonId={payingLessonId}
          studentId={studentId}
          open={!!payingLessonId}
          onOpenChange={(open) => !open && setPayingLessonId(null)}
        />
      )}

      {editingLesson && (
        <LessonFormDialog
          studentId={studentId}
          studentName={studentName}
          hourlyRate={hourlyRate}
          lesson={editingLesson}
          open={!!editingLesson}
          onOpenChange={(open) => !open && setEditingLesson(null)}
        />
      )}
    </>
  );
}
