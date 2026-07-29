import { z } from "zod";

export const examScoreSchema = z.object({
  exam_date: z.string().min(1, "יש לבחור תאריך"),
  subject: z.string().trim().min(1, "יש להזין נושא/מקצוע"),
  score: z.coerce.number().min(0, "הציון לא יכול להיות שלילי").max(100, "הציון לא יכול לעלות על 100"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ExamScoreFormValues = z.output<typeof examScoreSchema>;
export type ExamScoreFormInput = z.input<typeof examScoreSchema>;
