import { z } from "zod";

export const studentSchema = z.object({
  student_name: z.string().trim().min(1, "שם התלמיד/ה נדרש"),
  mother_name: z.string().trim().optional().or(z.literal("")),
  student_phone: z.string().trim().optional().or(z.literal("")),
  mother_phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  grade: z.string().trim().optional().or(z.literal("")),
  academic_level: z.string().trim().optional().or(z.literal("")),
  school: z.string().trim().optional().or(z.literal("")),
  hourly_rate: z.coerce.number().min(0, "מחיר לא יכול להיות שלילי"),
  preferred_learning_day: z.array(z.string()),
  preferred_learning_time: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["active", "paused", "archived"]),
  notes: z.string().trim().optional().or(z.literal("")),
  upcoming_exam_date: z.string().trim().optional().or(z.literal("")),
});

export type StudentFormValues = z.output<typeof studentSchema>;
export type StudentFormInput = z.input<typeof studentSchema>;

export const GRADES = ["ז", "ח", "ט", "י", "יא", "יב"] as const;
export const ACADEMIC_LEVELS = [
  '3 יח"ל',
  '4 יח"ל',
  '5 יח"ל',
  "הקבצה א",
  "הקבצה ב",
  "הקבצה ג",
] as const;
export const WEEK_DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "שבת"] as const;
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bit: "ביט",
  paybox: "פייבוקס",
  cash: "מזומן",
  bank_transfer: "העברה בנקאית",
};
