"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CheckCircle2, Wallet, XCircle, ChevronDown } from "lucide-react";
import { markLessonCompleted, cancelLesson } from "@/actions/lessons";
import { MarkPaidDialog } from "@/components/lessons/mark-paid-dialog";
import type { Lesson, Student } from "@/types/database";

export interface TodayLessonRow extends Lesson {
  student: Pick<Student, "id" | "student_name">;
}

export function TodaySchedule({ lessons }: { lessons: TodayLessonRow[] }) {
  const router = useRouter();
  const [payingLessonId, setPayingLessonId] = useState<string | null>(null);
  const payingLesson = lessons.find((l) => l.id === payingLessonId);

  async function complete(lesson: TodayLessonRow) {
    try {
      await markLessonCompleted(lesson.id, lesson.student_id);
      toast.success("השיעור סומן כהושלם");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function cancel(lesson: TodayLessonRow, timing: "in_time" | "late") {
    try {
      await cancelLesson(lesson.id, lesson.student_id, timing);
      toast.success("השיעור בוטל");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    }
  }

  async function openPayDialog(lesson: TodayLessonRow) {
    if (lesson.status === "scheduled") {
      try {
        await markLessonCompleted(lesson.id, lesson.student_id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "משהו השתבש");
        return;
      }
    }
    setPayingLessonId(lesson.id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">שיעורים היום</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {lessons.length === 0 && (
          <p className="text-sm text-muted-foreground">אין שיעורים מתוכננים להיום</p>
        )}
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
          >
            <div>
              <Link href={`/students/${lesson.student.id}`} className="font-medium hover:underline">
                {lesson.student.student_name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {new Date(lesson.date_time).toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" · "}
                {lesson.duration_minutes} דק&apos;
              </div>
            </div>
            {lesson.status === "scheduled" ? (
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => complete(lesson)}>
                  <CheckCircle2 className="size-4" />
                  הושלם
                </Button>
                <Button size="sm" variant="outline" onClick={() => openPayDialog(lesson)}>
                  <Wallet className="size-4" />
                  שולם
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="sm" variant="ghost">
                        <XCircle className="size-4" />
                        ביטול
                        <ChevronDown className="size-3" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => cancel(lesson, "in_time")}>
                      ביטול בזמן
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cancel(lesson, "late")}>
                      ביטול באיחור
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Badge variant="outline">
                {lesson.status === "completed" ? "הושלם" : "בוטל"}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>

      {payingLesson && (
        <MarkPaidDialog
          lessonId={payingLesson.id}
          studentId={payingLesson.student_id}
          open={!!payingLessonId}
          onOpenChange={(open) => !open && setPayingLessonId(null)}
        />
      )}
    </Card>
  );
}
