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
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";

export function LessonsBoard({
  upcoming,
  history,
  students,
}: {
  upcoming: LessonRow[];
  history: LessonRow[];
  students: { id: string; student_name: string }[];
}) {
  const entityLabel = useEntityLabel();
  const sessionLabel = useSessionLabel();
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
          <SelectItem value="all">כל {entityLabel.pluralDefinite}</SelectItem>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.student_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AllLessonsTable title={`${sessionLabel.plural} מתוכננים`} lessons={filteredUpcoming} />
      <AllLessonsTable title="היסטוריה" lessons={filteredHistory} />

      {filteredUpcoming.length === 0 && filteredHistory.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {studentId === "all"
            ? `אין עדיין ${sessionLabel.plural} במערכת`
            : `אין ${sessionLabel.plural} ל${entityLabel.singular} שנבחר/ה`}
        </p>
      )}
    </div>
  );
}
