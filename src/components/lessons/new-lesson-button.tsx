"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LessonFormDialog } from "./lesson-form";
import type { Student } from "@/types/database";

export function NewLessonButton({ students }: { students: Student[] }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = students.filter((s) =>
    s.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Button onClick={() => setPickerOpen(true)}>
        <Plus className="size-4" />
        קביעת שיעור
      </Button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>בחירת תלמיד/ה</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="חיפוש תלמיד/ה..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-8"
            />
          </div>
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {filtered.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => {
                  setSelected(student);
                  setPickerOpen(false);
                  setSearch("");
                }}
                className="rounded-lg border px-3 py-2.5 text-start text-sm hover:bg-muted"
              >
                {student.student_name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="p-3 text-center text-sm text-muted-foreground">לא נמצאו תלמידים</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selected && (
        <LessonFormDialog
          studentId={selected.id}
          studentName={selected.student_name}
          hourlyRate={selected.hourly_rate}
          defaultDurationMinutes={selected.default_lesson_duration_minutes}
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </>
  );
}
