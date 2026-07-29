"use client";

import { useMemo, useState } from "react";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthGrid, getWeekDays, addMonths, addWeeks, isSameMonth } from "@/lib/calendar";
import { isSameDay } from "@/lib/schedule-week";
import { lessonStatusRowClass } from "@/lib/lesson-style";
import { LessonFormDialog } from "@/components/lessons/lesson-form";
import type { LessonWithStudent, Student } from "@/types/database";

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const MAX_CHIPS_PER_DAY = 3;

function toLocalNoonIso(date: Date): string {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function LessonCalendar({
  students,
  lessons,
}: {
  students: Student[];
  lessons: LessonWithStudent[];
}) {
  const [view, setView] = useState<"week" | "month">("month");
  const [anchor, setAnchor] = useState(new Date());
  const [pickerDate, setPickerDate] = useState<Date | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pendingLesson, setPendingLesson] = useState<{
    studentId: string;
    studentName: string;
    hourlyRate: number;
    defaultDateTime: string;
  } | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonWithStudent | null>(null);

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, LessonWithStudent[]>();
    for (const lesson of lessons) {
      const key = new Date(lesson.date_time).toDateString();
      const list = map.get(key) ?? [];
      list.push(lesson);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.date_time.localeCompare(b.date_time));
    }
    return map;
  }, [lessons]);

  function lessonsFor(date: Date): LessonWithStudent[] {
    return lessonsByDay.get(date.toDateString()) ?? [];
  }

  function goPrev() {
    setAnchor((a) => (view === "month" ? addMonths(a, -1) : addWeeks(a, -1)));
  }
  function goNext() {
    setAnchor((a) => (view === "month" ? addMonths(a, 1) : addWeeks(a, 1)));
  }
  function goToday() {
    setAnchor(new Date());
  }

  const filteredStudents = students.filter((s) =>
    s.student_name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  function openPicker(date: Date) {
    setPickerDate(date);
    setPickerSearch("");
  }

  function pickStudent(student: Student) {
    if (!pickerDate) return;
    setPendingLesson({
      studentId: student.id,
      studentName: student.student_name,
      hourlyRate: student.hourly_rate,
      defaultDateTime: toLocalNoonIso(pickerDate),
    });
    setPickerDate(null);
  }

  const monthLabel = anchor.toLocaleDateString("he-IL", { year: "numeric", month: "long" });
  const weekDays = getWeekDays(anchor);
  const weekLabel = `${weekDays[0].toLocaleDateString("he-IL", { day: "numeric", month: "short" })} - ${weekDays[6].toLocaleDateString("he-IL", { day: "numeric", month: "short" })}`;

  function renderChip(lesson: LessonWithStudent) {
    const time = new Date(lesson.date_time).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <button
        key={lesson.id}
        type="button"
        onClick={() => setEditingLesson(lesson)}
        className={cn(
          "block w-full truncate rounded-md border px-1.5 py-0.5 text-start text-xs hover:opacity-80",
          lessonStatusRowClass(lesson.status) || "bg-muted/60"
        )}
        title={`${lesson.student.student_name} · ${time}`}
      >
        {time} {lesson.student.student_name}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="month">חודשי</TabsTrigger>
            <TabsTrigger value="week">שבועי</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" onClick={goToday}>
            היום
          </Button>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="ms-2 text-sm font-medium">{view === "month" ? monthLabel : weekLabel}</span>
        </div>
      </div>

      {view === "month" ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[700px] grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="text-center text-xs font-medium text-muted-foreground">
                {label}
              </div>
            ))}
            {getMonthGrid(anchor).flatMap((week, wi) =>
              week.map((date, di) => {
                const inMonth = isSameMonth(date, anchor);
                const isToday = isSameDay(date, new Date());
                const dayLessons = lessonsFor(date);
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={cn(
                      "flex min-h-24 flex-col gap-1 rounded-lg border p-1.5",
                      !inMonth && "opacity-40",
                      isToday && "border-primary ring-1 ring-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs", isToday && "font-semibold text-primary")}>
                        {date.getDate()}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPicker(date)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayLessons.slice(0, MAX_CHIPS_PER_DAY).map(renderChip)}
                      {dayLessons.length > MAX_CHIPS_PER_DAY && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayLessons.length - MAX_CHIPS_PER_DAY} נוספים
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((date) => {
            const isToday = isSameDay(date, new Date());
            const dayLessons = lessonsFor(date);
            return (
              <div
                key={date.toDateString()}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border p-2",
                  isToday && "border-primary bg-primary/5 ring-1 ring-primary/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", isToday && "text-primary")}>
                    {date.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "short" })}
                  </span>
                  {isToday && <Badge className="text-[10px]">היום</Badge>}
                </div>
                <div className="flex flex-col gap-1">
                  {dayLessons.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground">אין שיעורים</p>
                  )}
                  {dayLessons.map(renderChip)}
                </div>
                <Button variant="outline" size="sm" onClick={() => openPicker(date)}>
                  <Plus className="size-3.5" />
                  שיעור חדש
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!pickerDate} onOpenChange={(open) => !open && setPickerDate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              בחירת תלמיד/ה{pickerDate ? ` ל-${pickerDate.toLocaleDateString("he-IL")}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="חיפוש תלמיד/ה..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="pe-8"
            />
          </div>
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => pickStudent(student)}
                className="rounded-lg border px-3 py-2.5 text-start text-sm hover:bg-muted"
              >
                {student.student_name}
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <p className="p-3 text-center text-sm text-muted-foreground">לא נמצאו תלמידים</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {pendingLesson && (
        <LessonFormDialog
          studentId={pendingLesson.studentId}
          studentName={pendingLesson.studentName}
          hourlyRate={pendingLesson.hourlyRate}
          defaultDateTime={pendingLesson.defaultDateTime}
          open={!!pendingLesson}
          onOpenChange={(open) => !open && setPendingLesson(null)}
        />
      )}

      {editingLesson && (
        <LessonFormDialog
          studentId={editingLesson.student_id}
          studentName={editingLesson.student.student_name}
          hourlyRate={editingLesson.student.hourly_rate}
          lesson={editingLesson}
          open={!!editingLesson}
          onOpenChange={(open) => !open && setEditingLesson(null)}
        />
      )}
    </div>
  );
}
