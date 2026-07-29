export type StudentStatus = "active" | "paused" | "archived";

export type LessonStatus =
  | "scheduled"
  | "completed"
  | "cancelled_in_time"
  | "cancelled_late";

export type PaymentMethod = "bit" | "paybox" | "cash" | "bank_transfer";

export type Student = {
  id: string;
  created_at: string;
  teacher_id: string;
  student_name: string;
  mother_name: string;
  student_phone: string | null;
  mother_phone: string;
  address: string;
  grade: string;
  academic_level: string;
  school: string;
  hourly_rate: number;
  preferred_learning_day: string[];
  preferred_learning_time: string | null;
  status: StudentStatus;
  notes: string | null;
  upcoming_exam_date: string | null;
};

export type Lesson = {
  id: string;
  created_at: string;
  teacher_id: string;
  student_id: string;
  date_time: string;
  duration_minutes: number;
  price: number;
  status: LessonStatus;
  is_paid: boolean;
  payment_method: PaymentMethod | null;
  payment_date: string | null;
  lesson_summary: string | null;
};

export type LessonWithStudent = Lesson & {
  student: Pick<
    Student,
    "id" | "student_name" | "mother_phone" | "student_phone" | "hourly_rate"
  >;
};

export type ExamScore = {
  id: string;
  created_at: string;
  teacher_id: string;
  student_id: string;
  exam_date: string;
  subject: string;
  score: number;
  notes: string | null;
};

// Note: every type here (Student, Lesson, Database, and each table's
// Row/Insert/Update) must be a `type` alias, not an `interface`. Supabase's
// client resolves table types through several layers of nested generic
// defaults, and an `interface` reference in that chain makes the resolution
// bottom out at `never` instead of the real shape - `type` aliases resolve
// correctly. Matches the style `supabase gen types` itself emits.
export type Database = {
  public: {
    Tables: {
      students: {
        Row: Student;
        Insert: {
          teacher_id?: string;
          student_name: string;
          mother_name: string;
          student_phone?: string | null;
          mother_phone: string;
          address: string;
          grade: string;
          academic_level: string;
          school: string;
          hourly_rate: number;
          preferred_learning_day: string[];
          preferred_learning_time?: string | null;
          status?: StudentStatus;
          notes?: string | null;
          upcoming_exam_date?: string | null;
        };
        Update: {
          teacher_id?: string;
          student_name?: string;
          mother_name?: string;
          student_phone?: string | null;
          mother_phone?: string;
          address?: string;
          grade?: string;
          academic_level?: string;
          school?: string;
          hourly_rate?: number;
          preferred_learning_day?: string[];
          preferred_learning_time?: string | null;
          status?: StudentStatus;
          notes?: string | null;
          upcoming_exam_date?: string | null;
        };
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: {
          teacher_id?: string;
          student_id: string;
          date_time: string;
          duration_minutes?: number;
          price: number;
          status?: LessonStatus;
          is_paid?: boolean;
          payment_method?: PaymentMethod | null;
          payment_date?: string | null;
          lesson_summary?: string | null;
        };
        Update: {
          teacher_id?: string;
          student_id?: string;
          date_time?: string;
          duration_minutes?: number;
          price?: number;
          status?: LessonStatus;
          is_paid?: boolean;
          payment_method?: PaymentMethod | null;
          payment_date?: string | null;
          lesson_summary?: string | null;
        };
        Relationships: [];
      };
      exam_scores: {
        Row: ExamScore;
        Insert: {
          teacher_id?: string;
          student_id: string;
          exam_date: string;
          subject: string;
          score: number;
          notes?: string | null;
        };
        Update: {
          teacher_id?: string;
          student_id?: string;
          exam_date?: string;
          subject?: string;
          score?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
