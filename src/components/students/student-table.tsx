"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Pencil,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StudentFormDialog } from "./student-form";
import { StudentAvatar } from "./student-avatar";
import { setStudentStatus, reorderStudents } from "@/actions/students";
import { copyToClipboard } from "@/lib/clipboard";
import { GRADES, WEEK_DAYS } from "@/lib/validation/student";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/database";

const GRADE_RANK: Record<string, number> = Object.fromEntries(GRADES.map((g, i) => [g, i]));
function gradeRank(grade: string): number {
  return GRADE_RANK[grade] ?? 999;
}

const DAY_RANK: Record<string, number> = Object.fromEntries(WEEK_DAYS.map((d, i) => [d, i]));
function dayRank(student: Student): number {
  if (student.preferred_learning_day.length === 0) return 999;
  return Math.min(...student.preferred_learning_day.map((d) => DAY_RANK[d] ?? 999));
}

type SortKey = "grade" | "day";

const STATUS_LABEL: Record<Student["status"], string> = {
  active: "פעיל/ה",
  paused: "בהפסקה",
  archived: "בארכיון",
};

const STATUS_VARIANT: Record<Student["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  paused: "secondary",
  archived: "outline",
};

export function StudentTable({ students }: { students: Student[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Student | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Student | null>(null);
  const [order, setOrder] = useState<Student[]>(students);
  const [prevStudents, setPrevStudents] = useState(students);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (students !== prevStudents) {
    setPrevStudents(students);
    setOrder(students);
  }

  const dragEnabled = sort === null;
  const displayedStudents = sort
    ? [...order].sort((a, b) => {
        const diff =
          sort.key === "grade" ? gradeRank(a.grade) - gradeRank(b.grade) : dayRank(a) - dayRank(b);
        return sort.dir === "asc" ? diff : -diff;
      })
    : order;

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function renderSortIcon(key: SortKey) {
    if (sort?.key !== key) return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
    return sort.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
  }

  function handleDragStart(id: string) {
    if (!dragEnabled) return;
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent<HTMLTableRowElement>, overId: string) {
    if (!dragEnabled || !draggedId || draggedId === overId) return;
    e.preventDefault();
    setOrder((prev) => {
      const from = prev.findIndex((s) => s.id === draggedId);
      const to = prev.findIndex((s) => s.id === overId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleDragEnd() {
    if (!draggedId) return;
    setDraggedId(null);
    try {
      await reorderStudents(order.map((s) => s.id));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שמירת הסדר נכשלה");
    }
  }

  async function copyAddress(address: string) {
    try {
      await copyToClipboard(address);
      toast.success("הכתובת הועתקה");
    } catch {
      toast.error("העתקת הכתובת נכשלה");
    }
  }

  async function toggleArchive(student: Student) {
    const nextStatus = student.status === "archived" ? "active" : "archived";
    try {
      await setStudentStatus(student.id, nextStatus);
      toast.success(nextStatus === "archived" ? "התלמיד/ה הועבר/ה לארכיון" : "התלמיד/ה שוחזר/ה");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setArchiveTarget(null);
    }
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        לא נמצאו תלמידים תואמים
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>תלמיד/ה</TableHead>
              <TableHead className="hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => toggleSort("grade")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  כיתה / רמה
                  {renderSortIcon("grade")}
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => toggleSort("day")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  יום לימוד
                  {renderSortIcon("day")}
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">בית ספר</TableHead>
              <TableHead className="hidden lg:table-cell">כתובת</TableHead>
              <TableHead>יצירת קשר</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedStudents.map((student) => (
              <TableRow
                key={student.id}
                draggable={dragEnabled}
                onDragStart={() => handleDragStart(student.id)}
                onDragOver={(e) => handleDragOver(e, student.id)}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={cn(draggedId === student.id && "opacity-50")}
              >
                <TableCell className="cursor-grab px-0 text-center text-muted-foreground active:cursor-grabbing">
                  {dragEnabled ? (
                    <GripVertical className="mx-auto size-4" />
                  ) : (
                    <span
                      className="mx-auto block size-4"
                      title="נקו את המיון כדי לגרור ולסדר ידנית"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <StudentAvatar name={student.student_name} size="sm" />
                    <div>
                      <Link href={`/students/${student.id}`} className="hover:underline">
                        {student.student_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{student.mother_name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  כיתה {student.grade}
                  {student.academic_level && ` · ${student.academic_level}`}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.preferred_learning_day.length > 0 ? (
                    <>
                      {student.preferred_learning_day.join(", ")}
                      {student.preferred_learning_time && ` · ${student.preferred_learning_time}`}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{student.school}</TableCell>
                <TableCell className="hidden max-w-48 lg:table-cell">
                  {student.address && (
                    <button
                      type="button"
                      dir="auto"
                      title={`${student.address} (לחיצה להעתקה)`}
                      onClick={() => copyAddress(student.address)}
                      className="block w-full truncate rounded-sm hover:bg-muted hover:underline"
                    >
                      {student.address}
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {student.mother_phone}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      nativeButton={false}
                      render={
                        <a href={`tel:${student.mother_phone}`} aria-label="חיוג">
                          <Phone className="size-4" />
                        </a>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      nativeButton={false}
                      render={
                        <a
                          href={`https://wa.me/${student.mother_phone.replace(/\D/g, "").replace(/^0/, "972")}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="וואטסאפ"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[student.status]}>
                    {STATUS_LABEL[student.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(student)}>
                        <Pencil className="size-4" />
                        עריכה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setArchiveTarget(student)}>
                        {student.status === "archived" ? (
                          <>
                            <ArchiveRestore className="size-4" />
                            שחזור
                          </>
                        ) : (
                          <>
                            <Archive className="size-4" />
                            העברה לארכיון
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <StudentFormDialog
          student={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {archiveTarget?.status === "archived" ? "לשחזר את התלמיד/ה?" : "להעביר לארכיון?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.status === "archived"
                ? `${archiveTarget?.student_name} יחזור/תחזור לרשימת התלמידים הפעילים.`
                : `${archiveTarget?.student_name} יועבר/תועבר לארכיון ולא יוצג/תוצג ברשימת הפעילים.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveTarget && toggleArchive(archiveTarget)}>
              אישור
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
