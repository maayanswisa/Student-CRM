"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  MoreVertical,
  Wallet,
  MapPin,
  ListChecks,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMonthGrid,
  getWeekDays,
  addMonths,
  addWeeks,
  addDays,
  isSameMonth,
  isSameDay,
} from "@/lib/calendar";
import { lessonStatusRowClass, lessonStatusLabel } from "@/lib/lesson-style";
import { LessonFormDialog } from "@/components/lessons/lesson-form";
import { MarkPaidDialog } from "@/components/lessons/mark-paid-dialog";
import {
  ensureLessonForDate,
  markLessonCompleted,
  cancelLesson,
  checkLessonConflict,
  type LessonConflict,
} from "@/actions/lessons";
import { WEEK_DAYS } from "@/lib/validation/student";
import type { LessonWithStudent, Student } from "@/types/database";

function wazeUrl(address: string): string {
  return `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const MAX_CHIPS_PER_DAY = 3;

function toLocalNoonIso(date: Date): string {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function combineDateAndTime(date: Date, time: string | null): Date {
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    if (!Number.isNaN(h)) {
      d.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
      return d;
    }
  }
  d.setHours(12, 0, 0, 0);
  return d;
}

type DayItem =
  | { type: "lesson"; key: string; lesson: LessonWithStudent }
  | { type: "recurring"; key: string; student: Student; date: Date };

function dayItemTime(item: DayItem): number {
  return item.type === "lesson"
    ? new Date(item.lesson.date_time).getTime()
    : combineDateAndTime(item.date, item.student.preferred_learning_time).getTime();
}

export function LessonCalendar({
  students,
  lessons,
}: {
  students: Student[];
  lessons: LessonWithStudent[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [anchor, setAnchor] = useState(new Date());
  const [pickerDate, setPickerDate] = useState<Date | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pendingLesson, setPendingLesson] = useState<{
    studentId: string;
    studentName: string;
    hourlyRate: number;
    defaultDurationMinutes: number;
    defaultDateTime: string;
  } | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonWithStudent | null>(null);
  const [payingLesson, setPayingLesson] = useState<LessonWithStudent | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [confirmCloseWeek, setConfirmCloseWeek] = useState(false);
  const [closingWeek, setClosingWeek] = useState(false);
  const [recurringConflict, setRecurringConflict] = useState<{
    student: Student;
    date: Date;
    status: "completed" | "cancelled_in_time" | "cancelled_late";
    conflict: LessonConflict;
  } | null>(null);

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

  function dayItemsFor(date: Date): DayItem[] {
    const dayLessons = lessonsFor(date);
    const scheduledStudentIds = new Set(dayLessons.map((l) => l.student_id));
    const letter = WEEK_DAYS[date.getDay()];
    const recurringStudents = students.filter(
      (s) => s.preferred_learning_day.includes(letter) && !scheduledStudentIds.has(s.id)
    );
    return [
      ...dayLessons.map((lesson) => ({ type: "lesson" as const, key: lesson.id, lesson })),
      ...recurringStudents.map((student) => ({
        type: "recurring" as const,
        key: `recurring-${student.id}-${date.toDateString()}`,
        student,
        date,
      })),
    ];
  }

  function goPrev() {
    setAnchor((a) =>
      view === "month" ? addMonths(a, -1) : view === "week" ? addWeeks(a, -1) : addDays(a, -1)
    );
  }
  function goNext() {
    setAnchor((a) =>
      view === "month" ? addMonths(a, 1) : view === "week" ? addWeeks(a, 1) : addDays(a, 1)
    );
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
      defaultDurationMinutes: student.default_lesson_duration_minutes,
      defaultDateTime: toLocalNoonIso(pickerDate),
    });
    setPickerDate(null);
  }

  function openRecurringSlot(student: Student, date: Date) {
    setPendingLesson({
      studentId: student.id,
      studentName: student.student_name,
      hourlyRate: student.hourly_rate,
      defaultDurationMinutes: student.default_lesson_duration_minutes,
      defaultDateTime: combineDateAndTime(date, student.preferred_learning_time).toISOString(),
    });
  }

  async function markRecurring(
    student: Student,
    date: Date,
    status: "completed" | "cancelled_in_time" | "cancelled_late"
  ) {
    const key = `recurring-${student.id}-${date.toDateString()}`;
    setBusyKey(key);
    try {
      const dateIso = combineDateAndTime(date, student.preferred_learning_time).toISOString();
      const found = await checkLessonConflict(
        dateIso,
        student.default_lesson_duration_minutes,
        undefined,
        student.id
      );
      if (found) {
        setRecurringConflict({ student, date, status, conflict: found });
        return;
      }
      await proceedMarkRecurring(student, date, status);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusyKey(null);
    }
  }

  async function proceedMarkRecurring(
    student: Student,
    date: Date,
    status: "completed" | "cancelled_in_time" | "cancelled_late"
  ) {
    const key = `recurring-${student.id}-${date.toDateString()}`;
    setBusyKey(key);
    try {
      const dateIso = combineDateAndTime(date, student.preferred_learning_time).toISOString();
      const lessonId = await ensureLessonForDate(
        student.id,
        dateIso,
        student.hourly_rate,
        student.default_lesson_duration_minutes
      );
      if (status === "completed") {
        await markLessonCompleted(lessonId, student.id);
        toast.success("השיעור סומן כהתקיים");
      } else {
        await cancelLesson(lessonId, student.id, status === "cancelled_in_time" ? "in_time" : "late");
        toast.success("השיעור סומן כבוטל");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusyKey(null);
      setRecurringConflict(null);
    }
  }

  async function markLessonStatus(
    lesson: LessonWithStudent,
    status: "completed" | "cancelled_in_time" | "cancelled_late"
  ) {
    setBusyKey(lesson.id);
    try {
      if (status === "completed") {
        await markLessonCompleted(lesson.id, lesson.student_id);
        toast.success("השיעור סומן כהתקיים");
      } else {
        await cancelLesson(lesson.id, lesson.student_id, status === "cancelled_in_time" ? "in_time" : "late");
        toast.success("השיעור סומן כבוטל");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setBusyKey(null);
    }
  }

  const monthLabel = anchor.toLocaleDateString("he-IL", { year: "numeric", month: "long" });
  const dayLabel = anchor.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const weekDays = getWeekDays(anchor);
  const weekLabel = `${weekDays[0].toLocaleDateString("he-IL", { day: "numeric", month: "short" })} - ${weekDays[6].toLocaleDateString("he-IL", { day: "numeric", month: "short" })}`;

  function weekItemsToClose(): DayItem[] {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return weekDays
      .flatMap((date) => dayItemsFor(date))
      .filter((item) => {
        if (dayItemTime(item) > endOfToday.getTime()) return false;
        return item.type === "recurring" || item.lesson.status === "scheduled";
      });
  }

  async function closeWeek() {
    const items = weekItemsToClose();
    setClosingWeek(true);
    try {
      const conflictChecks = await Promise.all(
        items.map((item) =>
          item.type === "recurring"
            ? checkLessonConflict(
                combineDateAndTime(item.date, item.student.preferred_learning_time).toISOString(),
                item.student.default_lesson_duration_minutes,
                undefined,
                item.student.id
              )
            : Promise.resolve(null)
        )
      );
      const closable = items.filter((_, i) => !conflictChecks[i]);
      const skippedForConflict = items.length - closable.length;

      const results = await Promise.allSettled(
        closable.map((item) =>
          item.type === "recurring"
            ? ensureLessonForDate(
                item.student.id,
                combineDateAndTime(item.date, item.student.preferred_learning_time).toISOString(),
                item.student.hourly_rate,
                item.student.default_lesson_duration_minutes
              ).then((lessonId) => markLessonCompleted(lessonId, item.student.id))
            : markLessonCompleted(item.lesson.id, item.lesson.student_id)
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = results.length - failed;
      if (succeeded > 0) toast.success(`${succeeded} שיעורים סומנו כהושלמו`);
      if (failed > 0) toast.error(`${failed} שיעורים נכשלו`);
      if (skippedForConflict > 0) {
        toast.error(`${skippedForConflict} שיעורים דולגו בגלל התנגשות בזמנים - יש לטפל בהם ידנית`);
      }
      router.refresh();
    } finally {
      setClosingWeek(false);
      setConfirmCloseWeek(false);
    }
  }

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
          lessonStatusRowClass(lesson) || "bg-muted/60"
        )}
        title={`${lesson.student.student_name} · ${time}`}
      >
        {time} {lesson.student.student_name}
      </button>
    );
  }

  function renderRecurringChip(student: Student, date: Date) {
    const time = student.preferred_learning_time;
    const key = `recurring-${student.id}-${date.toDateString()}`;
    const isBusy = busyKey === key;
    return (
      <DropdownMenu key={key}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              disabled={isBusy}
              className="block w-full truncate rounded-md border border-dashed px-1.5 py-0.5 text-start text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
              title={`${student.student_name}${time ? ` · ${time}` : ""} (לפי מערכת שעות שבועית)`}
            >
              {time ? `${time} ` : ""}
              {student.student_name}
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => markRecurring(student, date, "completed")}>
            <CheckCircle2 className="size-4 text-green-600" />
            שיעור התקיים
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => markRecurring(student, date, "cancelled_in_time")}>
            <XCircle className="size-4 text-red-600" />
            התבטל בזמן
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => markRecurring(student, date, "cancelled_late")}>
            <XCircle className="size-4 text-red-600" />
            התבטל באיחור
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openRecurringSlot(student, date)}>
            <Pencil className="size-4" />
            עריכת פרטים (מחיר / משך)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function renderDayItem(item: DayItem) {
    return item.type === "lesson" ? renderChip(item.lesson) : renderRecurringChip(item.student, item.date);
  }

  function renderDayRow(item: DayItem) {
    if (item.type === "lesson") {
      const lesson = item.lesson;
      const time = new Date(lesson.date_time).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const isBusy = busyKey === lesson.id;
      return (
        <div
          key={item.key}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg border p-2.5",
            lessonStatusRowClass(lesson)
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tabular-nums">{time}</span>
            <div>
              <div className="text-sm font-medium">{lesson.student.student_name}</div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {lessonStatusLabel(lesson)}
                </Badge>
                <span>{Number(lesson.price)} ש&quot;ח</span>
                {lesson.is_paid && (
                  <Badge className="text-[10px]" variant="secondary">
                    שולם
                  </Badge>
                )}
              </div>
              {lesson.student.address && (
                <a
                  href={wazeUrl(lesson.student.address)}
                  dir="auto"
                  title={`${lesson.student.address} (פתיחה בוויז)`}
                  className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  <MapPin className="size-3" />
                  {lesson.student.address}
                </a>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8" disabled={isBusy}>
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {lesson.status !== "completed" && (
                <DropdownMenuItem onClick={() => markLessonStatus(lesson, "completed")}>
                  <CheckCircle2 className="size-4 text-green-600" />
                  סימון כהושלם
                </DropdownMenuItem>
              )}
              {lesson.status !== "cancelled_in_time" && (
                <DropdownMenuItem onClick={() => markLessonStatus(lesson, "cancelled_in_time")}>
                  <XCircle className="size-4 text-red-600" />
                  ביטול בזמן
                </DropdownMenuItem>
              )}
              {lesson.status !== "cancelled_late" && (
                <DropdownMenuItem onClick={() => markLessonStatus(lesson, "cancelled_late")}>
                  <XCircle className="size-4 text-red-600" />
                  ביטול באיחור
                </DropdownMenuItem>
              )}
              {lesson.status === "completed" && !lesson.is_paid && (
                <DropdownMenuItem onClick={() => setPayingLesson(lesson)}>
                  <Wallet className="size-4" />
                  סימון כשולם
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setEditingLesson(lesson)}>
                <Pencil className="size-4" />
                עריכת פרטים
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    const { student, date } = item;
    const time = student.preferred_learning_time;
    const isBusy = busyKey === item.key;
    return (
      <div
        key={item.key}
        className="flex items-center justify-between gap-2 rounded-lg border border-dashed p-2.5 text-muted-foreground"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums">{time ?? "--:--"}</span>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {student.student_name}
              <span className="text-xs font-normal">(לפי מערכת שעות שבועית)</span>
            </div>
            {student.address && (
              <a
                href={wazeUrl(student.address)}
                dir="auto"
                title={`${student.address} (פתיחה בוויז)`}
                className="mt-0.5 flex items-center gap-1 text-xs hover:text-foreground hover:underline"
              >
                <MapPin className="size-3" />
                {student.address}
              </a>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8" disabled={isBusy}>
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => markRecurring(student, date, "completed")}>
              <CheckCircle2 className="size-4 text-green-600" />
              שיעור התקיים
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => markRecurring(student, date, "cancelled_in_time")}>
              <XCircle className="size-4 text-red-600" />
              התבטל בזמן
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => markRecurring(student, date, "cancelled_late")}>
              <XCircle className="size-4 text-red-600" />
              התבטל באיחור
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openRecurringSlot(student, date)}>
              <Pencil className="size-4" />
              עריכת פרטים (מחיר / משך)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const weekCloseCount = view === "week" ? weekItemsToClose().length : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
          <TabsList>
            <TabsTrigger value="month">חודשי</TabsTrigger>
            <TabsTrigger value="week">שבועי</TabsTrigger>
            <TabsTrigger value="day">יומי</TabsTrigger>
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
          <span className="ms-2 text-sm font-medium">
            {view === "month" ? monthLabel : view === "week" ? weekLabel : dayLabel}
          </span>
          {view === "week" && (
            <Button
              variant="outline"
              size="sm"
              className="ms-2"
              disabled={weekCloseCount === 0 || closingWeek}
              onClick={() => setConfirmCloseWeek(true)}
            >
              <ListChecks className="size-3.5" />
              סגירת השבוע
              {weekCloseCount > 0 && ` (${weekCloseCount})`}
            </Button>
          )}
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
                const dayItems = dayItemsFor(date);
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
                      {dayItems.slice(0, MAX_CHIPS_PER_DAY).map(renderDayItem)}
                      {dayItems.length > MAX_CHIPS_PER_DAY && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayItems.length - MAX_CHIPS_PER_DAY} נוספים
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : view === "day" ? (
        <div className="flex flex-col gap-2">
          {dayItemsFor(anchor)
            .sort((a, b) => dayItemTime(a) - dayItemTime(b))
            .map(renderDayRow)}
          {dayItemsFor(anchor).length === 0 && (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              אין שיעורים ביום זה
            </p>
          )}
          <Button variant="outline" size="sm" className="self-start" onClick={() => openPicker(anchor)}>
            <Plus className="size-3.5" />
            שיעור חדש
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((date) => {
            const isToday = isSameDay(date, new Date());
            const dayItems = dayItemsFor(date);
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
                  {dayItems.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground">אין שיעורים</p>
                  )}
                  {dayItems.map(renderDayItem)}
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
          defaultDurationMinutes={pendingLesson.defaultDurationMinutes}
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

      {payingLesson && (
        <MarkPaidDialog
          lessonId={payingLesson.id}
          studentId={payingLesson.student_id}
          open={!!payingLesson}
          onOpenChange={(open) => !open && setPayingLesson(null)}
        />
      )}

      <AlertDialog open={confirmCloseWeek} onOpenChange={(open) => !closingWeek && setConfirmCloseWeek(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>לסגור את השבוע?</AlertDialogTitle>
            <AlertDialogDescription>
              {weekCloseCount} שיעורים (עד היום) עדיין לא סומנו ויעודכנו כ&quot;הושלם&quot;. שיעורים
              שכבר סומנו כבוטלו או הושלמו לא ישתנו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingWeek}>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={closeWeek} disabled={closingWeek}>
              {closingWeek ? "סוגר..." : "סגירת השבוע"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!recurringConflict}
        onOpenChange={(open) => !open && setRecurringConflict(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>יש התנגשות בזמנים</AlertDialogTitle>
            <AlertDialogDescription>
              כבר יש שיעור עם {recurringConflict?.conflict.studentName} בשעה{" "}
              {recurringConflict?.conflict.time} שחופף לזמן הזה. לקבוע בכל זאת?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busyKey}>ביטול</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!busyKey}
              onClick={() =>
                recurringConflict &&
                proceedMarkRecurring(
                  recurringConflict.student,
                  recurringConflict.date,
                  recurringConflict.status
                )
              }
            >
              קביעה בכל זאת
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
