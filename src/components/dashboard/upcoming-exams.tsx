import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import type { Student } from "@/types/database";

export function UpcomingExams({
  students,
}: {
  students: Pick<Student, "id" | "student_name" | "upcoming_exam_date" | "grade">[];
}) {
  const sorted = [...students].sort((a, b) =>
    (a.upcoming_exam_date ?? "").localeCompare(b.upcoming_exam_date ?? "")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">מבחנים בשבוע הקרוב</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">אין מבחנים קרובים</p>
        )}
        {sorted.map((student) => (
          <div key={student.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-muted-foreground" />
              <Link href={`/students/${student.id}`} className="font-medium hover:underline">
                {student.student_name}
              </Link>
              <span className="text-xs text-muted-foreground">כיתה {student.grade}</span>
            </div>
            <span className="text-sm">
              {new Date(student.upcoming_exam_date!).toLocaleDateString("he-IL")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
