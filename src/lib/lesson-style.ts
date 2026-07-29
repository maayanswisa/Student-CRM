import type { LessonStatus } from "@/types/database";

export function lessonStatusRowClass(status: LessonStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-50 hover:bg-green-100/70 dark:bg-green-950/20 dark:hover:bg-green-950/30";
    case "cancelled_in_time":
    case "cancelled_late":
      return "bg-red-50 hover:bg-red-100/70 dark:bg-red-950/20 dark:hover:bg-red-950/30";
    default:
      return "";
  }
}
