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
import { CheckCircle2, Wallet, XCircle, ChevronDown, MessageCircle, MoreVertical, Pencil } from "lucide-react";
import { markLessonCompleted, cancelLesson } from "@/actions/lessons";
import { MarkPaidDialog } from "@/components/lessons/mark-paid-dialog";
import { LessonFormDialog } from "@/components/lessons/lesson-form";
import { copyToClipboard } from "@/lib/clipboard";
import type { Lesson, Student } from "@/types/database";

export interface TodayLessonRow extends Lesson {
  student: Pick<Student, "id" | "student_name" | "mother_name" | "address" | "mother_phone">;
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "972")}`;
}

export function TodaySchedule({ lessons }: { lessons: TodayLessonRow[] }) {
  const router = useRouter();
  const [payingLessonId, setPayingLessonId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<TodayLessonRow | null>(null);
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

  async function copyAddress(address: string) {
    try {
      await copyToClipboard(address);
      toast.success("הכתובת הועתקה");
    } catch {
      toast.error("העתקת הכתובת נכשלה");
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
            <div className="flex items-start gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/students/${lesson.student.id}`} className="font-medium hover:underline">
                    {lesson.student.student_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">· {lesson.student.mother_name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(lesson.date_time).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {lesson.duration_minutes} דק&apos;
                  {lesson.student.address && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        dir="auto"
                        title="לחיצה להעתקת הכתובת"
                        onClick={() => copyAddress(lesson.student.address)}
                        className="underline decoration-dotted hover:text-foreground"
                      >
                        {lesson.student.address}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                nativeButton={false}
                render={
                  <a href={waLink(lesson.student.mother_phone)} target="_blank" rel="noreferrer" aria-label="וואטסאפ">
                    <MessageCircle className="size-4" />
                  </a>
                }
              />
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
                    <DropdownMenuItem onClick={() => setEditingLesson(lesson)}>
                      <Pencil className="size-4" />
                      עריכה / הוספת פתק
                    </DropdownMenuItem>
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
              <div className="flex items-center gap-1.5">
                <Badge variant="outline">
                  {lesson.status === "completed" ? "הושלם" : "בוטל"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="icon" variant="ghost" className="size-8">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
    </Card>
  );
}
