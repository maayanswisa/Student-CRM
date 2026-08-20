"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllLessonsTable, type LessonRow } from "./all-lessons-table";

export function LessonsBoard({
  upcoming,
  history,
  students,
}: {
  upcoming: LessonRow[];
  history: LessonRow[];
  students: { id: string; student_name: string }[];
}) {
  const [studentId, setStudentId] = useState<string>("all");

  const filteredUpcoming =
    studentId === "all" ? upcoming : upcoming.filter((l) => l.student.id === studentId);
  const filteredHistory =
    studentId === "all" ? history : history.filter((l) => l.student.id === studentId);

  return (
    <div className="flex flex-col gap-4">
      <Select value={studentId} onValueChange={(v) => setStudentId(v ?? "all")}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל התלמידים</SelectItem>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.student_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AllLessonsTable title="שיעורים מתוכננים" lessons={filteredUpcoming} />
      <AllLessonsTable title="היסטוריה" lessons={filteredHistory} />

      {filteredUpcoming.length === 0 && filteredHistory.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {studentId === "all" ? "אין עדיין שיעורים במערכת" : "אין שיעורים לתלמיד/ה שנבחר/ה"}
        </p>
      )}
    </div>
  );
}
