import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeacherActivityRow } from "@/actions/admin";

function formatDateTime(iso: string | null): string {
  if (!iso) return "מעולם לא";
  return new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
}

export function TeacherActivityTable({ teachers }: { teachers: TeacherActivityRow[] }) {
  if (teachers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        אין עדיין מורים רשומים
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>אימייל</TableHead>
            <TableHead>תאריך הרשמה</TableHead>
            <TableHead>כניסה אחרונה</TableHead>
            <TableHead>תלמידים</TableHead>
            <TableHead>שיעורים</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell className="font-medium" dir="ltr">
                {teacher.email}
              </TableCell>
              <TableCell>{formatDateTime(teacher.createdAt)}</TableCell>
              <TableCell>{formatDateTime(teacher.lastSignInAt)}</TableCell>
              <TableCell>{teacher.studentsManaged}</TableCell>
              <TableCell>{teacher.lessonsLogged}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
