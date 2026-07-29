"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExamScoreFormDialog } from "./exam-score-form";
import { deleteExamScore } from "@/actions/exam-scores";
import type { ExamScore } from "@/types/database";

export function ExamScoresSection({
  studentId,
  scores,
}: {
  studentId: string;
  scores: ExamScore[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamScore | null>(null);
  const [deleting, setDeleting] = useState<ExamScore | null>(null);

  const sorted = [...scores].sort((a, b) => b.exam_date.localeCompare(a.exam_date));
  const chronological = [...scores].sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  const average =
    scores.length > 0 ? scores.reduce((sum, s) => sum + Number(s.score), 0) / scores.length : null;
  const last = chronological.at(-1);
  const prev = chronological.at(-2);
  const trend = last && prev ? Number(last.score) - Number(prev.score) : null;

  async function remove(score: ExamScore) {
    try {
      await deleteExamScore(score.id, studentId);
      toast.success("הציון נמחק");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">מעקב ציונים והתקדמות</CardTitle>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          הוספת ציון
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {scores.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין עדיין ציונים רשומים</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">ממוצע</p>
                <p className="text-lg font-semibold">{average?.toFixed(1)}</p>
              </div>
              {trend !== null && (
                <div className="flex items-center gap-1.5 rounded-lg border p-3">
                  {trend > 0 && <TrendingUp className="size-4 text-green-600" />}
                  {trend < 0 && <TrendingDown className="size-4 text-destructive" />}
                  {trend === 0 && <Minus className="size-4 text-muted-foreground" />}
                  <span className="text-sm">
                    {trend > 0 ? "+" : ""}
                    {trend.toFixed(1)} מהציון הקודם
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>תאריך</TableHead>
                    <TableHead>נושא</TableHead>
                    <TableHead>ציון</TableHead>
                    <TableHead>הערות</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>{new Date(score.exam_date).toLocaleDateString("he-IL")}</TableCell>
                      <TableCell>{score.subject}</TableCell>
                      <TableCell className="font-medium">{Number(score.score)}</TableCell>
                      <TableCell className="max-w-48 truncate">{score.notes}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setEditing(score)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setDeleting(score)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      <ExamScoreFormDialog studentId={studentId} open={formOpen} onOpenChange={setFormOpen} />

      {editing && (
        <ExamScoreFormDialog
          studentId={studentId}
          examScore={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הציון?</AlertDialogTitle>
            <AlertDialogDescription>הפעולה בלתי הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove(deleting)}>מחיקה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
