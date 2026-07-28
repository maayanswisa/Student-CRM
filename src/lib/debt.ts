import type { Lesson } from "@/types/database";

export interface StudentDebt {
  totalOwed: number;
  unpaidCount: number;
  oldestUnpaidDate: string | null;
}

export function computeDebt(lessons: Pick<Lesson, "status" | "is_paid" | "price" | "date_time">[]): StudentDebt {
  const unpaid = lessons.filter(
    (lesson) => lesson.status === "completed" && !lesson.is_paid
  );

  const totalOwed = unpaid.reduce((sum, lesson) => sum + Number(lesson.price), 0);
  const oldestUnpaidDate = unpaid.reduce<string | null>((oldest, lesson) => {
    if (!oldest || new Date(lesson.date_time) < new Date(oldest)) {
      return lesson.date_time;
    }
    return oldest;
  }, null);

  return {
    totalOwed,
    unpaidCount: unpaid.length,
    oldestUnpaidDate,
  };
}

export function daysSince(dateIso: string): number {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
