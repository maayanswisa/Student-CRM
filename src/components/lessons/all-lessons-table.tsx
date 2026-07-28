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
import { MoreVertical, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { markLessonCompleted, cancelLesson } from "@/actions/lessons";
import { MarkPaidDialog } from "./mark-paid-dialog";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import type { Lesson, LessonStatus, Student } from "@/types/database";

export interface LessonRow extends Lesson {
  student: Pick<Student, "id" | "student_name">;
}

const STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled_in_time: "בוטל בזמן",
  cancelled_late: "בוטל באיחור",
};

const STATUS_VARIANT: Record<LessonStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "secondary",
  completed: "default",
  cancelled_in_time: "outline",
  cancelled_late: "destructive",
};

export function AllLessonsTable({ title, lessons }: { title: string; lessons: LessonRow[] }) {
  const router = useRouter();
  const [payingLessonId, setPayingLessonId] = useState<string | null>(null);
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
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
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
                  <Badge variant={STATUS_VARIANT[lesson.status]}>{STATUS_LABEL[lesson.status]}</Badge>
                </TableCell>
                <TableCell>
                  {lesson.status === "scheduled" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => complete(lesson)}>
                          <CheckCircle2 className="size-4" />
                          סימון כהושלם
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPayingLessonId(lesson.id)}>
                          <Wallet className="size-4" />
                          סימון כשולם
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => cancel(lesson, "in_time")}>
                          <XCircle className="size-4" />
                          ביטול בזמן
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => cancel(lesson, "late")}>
                          <XCircle className="size-4" />
                          ביטול באיחור
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : lesson.status === "completed" && !lesson.is_paid ? (
                    <Button variant="ghost" size="sm" onClick={() => setPayingLessonId(lesson.id)}>
                      <Wallet className="size-4" />
                      סימון כשולם
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {payingLesson && (
        <MarkPaidDialog
          lessonId={payingLesson.id}
          studentId={payingLesson.student_id}
          open={!!payingLessonId}
          onOpenChange={(open) => !open && setPayingLessonId(null)}
        />
      )}
    </div>
  );
}
