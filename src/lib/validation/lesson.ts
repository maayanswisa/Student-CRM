import { z } from "zod";

export const lessonSchema = z.object({
  student_id: z.string().uuid("יש לבחור תלמיד/ה"),
  date_time: z.string().min(1, "יש לבחור תאריך ושעה"),
  duration_minutes: z.coerce.number().min(15),
  price: z.coerce.number().min(0),
  lesson_summary: z.string().trim().optional().or(z.literal("")),
});

export type LessonFormValues = z.output<typeof lessonSchema>;
export type LessonFormInput = z.input<typeof lessonSchema>;

export const LESSON_STATUS_LABELS: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled_in_time: "בוטל בזמן",
  cancelled_late: "בוטל באיחור",
};
