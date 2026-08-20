"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Wallet,
  Pencil,
  Trash2,
  MessageSquareText,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markLessonCompleted, cancelLesson, deleteLesson } from "@/actions/lessons";
import { MarkPaidDialog } from "./mark-paid-dialog";
import { LessonFormDialog } from "./lesson-form";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import { lessonStatusRowClass, lessonStatusLabel } from "@/lib/lesson-style";
import { cn } from "@/lib/utils";
import type { Lesson, LessonStatus, Student } from "@/types/database";

export interface LessonRow extends Lesson {
  student: Pick<Student, "id" | "student_name">;
}

const STATUS_VARIANT: Record<LessonStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "secondary",
  completed: "default",
  cancelled_in_time: "outline",
  cancelled_late: "destructive",
};

export function AllLessonsTable({ title, lessons }: { title: string; lessons: LessonRow[] }) {
  const router = useRouter();
  const [payingLessonId, setPayingLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonRow | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonRow | null>(null);
  const payingLesson = lessons.find((l) => l.id === payingLessonId);

  async function complete(lesson: LessonRow) {
    try {
      await markLessonCompleted(lesson.id, lesson.student_id);
      toast.success("השיעור סומן כהושלם");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function cancel(lesson: LessonRow, timing: "in_time" | "late") {
    try {
      await cancelLesson(lesson.id, lesson.student_id, timing);
      toast.success("השיעור בוטל");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function remove(lesson: LessonRow) {
    try {
      await deleteLesson(lesson.id, lesson.student_id);
      toast.success("השיעור נמחק");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setDeletingLesson(null);
    }
  }

  if (lessons.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תלמיד/ה</TableHead>
              <TableHead>תאריך</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead className="w-8" />
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id} className={cn(lessonStatusRowClass(lesson))}>
                <TableCell>
                  <Link href={`/students/${lesson.student.id}`} className="font-medium hover:underline">
                    {lesson.student.student_name}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(lesson.date_time).toLocaleString("he-IL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  {Number(lesson.price).toFixed(0)} ₪
                  {lesson.is_paid && lesson.payment_method && (
                    <span className="ms-1 text-xs text-muted-foreground">
                      ({PAYMENT_METHOD_LABELS[lesson.payment_method]})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[lesson.status]}>{lessonStatusLabel(lesson)}</Badge>
                </TableCell>
                <TableCell>
                  {lesson.lesson_summary && (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground"
                            title="יש פתק לשיעור זה"
                          >
                            <MessageSquareText className="size-4" />
                          </Button>
                        }
                      />
                      <PopoverContent>
                        <PopoverHeader>
                          <PopoverTitle>פתק לשיעור</PopoverTitle>
                        </PopoverHeader>
                        <p className="whitespace-pre-wrap text-sm">{lesson.lesson_summary}</p>
                      </PopoverContent>
                    </Popover>
                  )}
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
                      {lesson.status === "completed" && !lesson.is_paid && (
                        <DropdownMenuItem onClick={() => setPayingLessonId(lesson.id)}>
                          <Wallet className="size-4" />
                          סימון כשולם
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

      {payingLesson && (
        <MarkPaidDialog
          lessonId={payingLesson.id}
          studentId={payingLesson.student_id}
          open={!!payingLessonId}
          onOpenChange={(open) => !open && setPayingLessonId(null)}
        />
      )}

      {editingLesson && (
        <LessonFormDialog
          studentId={editingLesson.student_id}
          studentName={editingLesson.student.student_name}
          hourlyRate={editingLesson.price}
          lesson={editingLesson}
          open={!!editingLesson}
          onOpenChange={(open) => !open && setEditingLesson(null)}
        />
      )}
    </div>
  );
}
