import { LESSON_STATUS_LABELS } from "@/lib/validation/lesson";
import type { Lesson, LessonStatus } from "@/types/database";

export function lessonStatusLabel(lesson: Pick<Lesson, "status" | "is_paid">): string {
  if (lesson.status === "completed") {
    return lesson.is_paid ? "הושלם" : "לא שולם";
  }
  return LESSON_STATUS_LABELS[lesson.status] ?? lesson.status;
}

export function lessonStatusRowClass(
  lesson: Pick<Lesson, "status" | "is_paid">
): string {
  if (lesson.is_paid) {
    return "bg-blue-100 hover:bg-blue-200/70 dark:bg-blue-900/40 dark:hover:bg-blue-900/55";
  }
  switch (lesson.status as LessonStatus) {
    case "completed":
      return "bg-green-100 hover:bg-green-200/70 dark:bg-green-900/40 dark:hover:bg-green-900/55";
    case "cancelled_in_time":
    case "cancelled_late":
      return "bg-red-50 hover:bg-red-100/70 dark:bg-red-950/20 dark:hover:bg-red-950/30";
    default:
      return "";
  }
}
