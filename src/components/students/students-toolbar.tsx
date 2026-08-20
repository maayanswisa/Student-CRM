"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADES } from "@/lib/validation/student";
import { StudentFormDialog } from "./student-form";
import { StudentImportDialog } from "./student-import-dialog";
import { ExportMenuButton } from "@/components/shared/export-menu-button";
import { getStudentsExportRows } from "@/actions/students";
import { buildCsv, buildXlsxBlob, downloadBlob } from "@/lib/export";
import { useEntityLabel } from "@/components/providers/entity-label-provider";

const STATUS_LABELS: Record<string, string> = {
  active: "פעיל/ה",
  paused: "בהפסקה",
  archived: "בארכיון",
  all: "הכל",
};

const GRADE_LABELS: Record<string, string> = {
  all: "כל הכיתות",
  ...Object.fromEntries(GRADES.map((g) => [g, `כיתה ${g}`])),
};

export function StudentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const entityLabel = useEntityLabel();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function exportStudentsCsv() {
    const rows = await getStudentsExportRows();
    downloadBlob(
      new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" }),
      `${entityLabel.plural}.csv`
    );
  }

  async function exportStudentsXlsx() {
    const rows = await getStudentsExportRows();
    downloadBlob(buildXlsxBlob(rows, entityLabel.plural), `${entityLabel.plural}.xlsx`);
  }

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם או בית ספר..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setParam("q", e.target.value);
            }}
            className="pe-8"
          />
        </div>
        <Select
          defaultValue={searchParams.get("status") ?? "active"}
          onValueChange={(v) => setParam("status", v)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="סטטוס">
              {(value: string) => STATUS_LABELS[value] ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">פעיל/ה</SelectItem>
            <SelectItem value="paused">בהפסקה</SelectItem>
            <SelectItem value="archived">בארכיון</SelectItem>
            <SelectItem value="all">הכל</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={searchParams.get("grade") ?? "all"}
          onValueChange={(v) => setParam("grade", v)}
        >
          <SelectTrigger className="sm:w-32">
            <SelectValue placeholder="כיתה">
              {(value: string) => GRADE_LABELS[value] ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הכיתות</SelectItem>
            {GRADES.map((g) => (
              <SelectItem key={g} value={g}>
                כיתה {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <ExportMenuButton
          label={`ייצוא ${entityLabel.plural}`}
          onExportCsv={exportStudentsCsv}
          onExportXlsx={exportStudentsXlsx}
        />
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="size-4" />
          ייבוא {entityLabel.plural}
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          {entityLabel.singular} חדש/ה
        </Button>
      </div>
      <StudentFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <StudentImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
