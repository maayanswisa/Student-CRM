"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getImportFields,
  autoMatchColumns,
  buildRowInput,
  parseSpreadsheetFile,
  type ImportFieldKey,
  type ParsedSheet,
} from "@/lib/import-students";
import { bulkCreateStudents } from "@/actions/students";
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";

const NONE = "__none__";
const PREVIEW_FIELDS: ImportFieldKey[] = [
  "student_name",
  "mother_phone",
  "grade",
  "school",
  "hourly_rate",
];

export function StudentImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const entityLabel = useEntityLabel();
  const sessionLabel = useSessionLabel();
  const importFields = getImportFields(entityLabel, sessionLabel);
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<ImportFieldKey, string | null>>(
    {} as Record<ImportFieldKey, string | null>
  );
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setParsed(null);
    setMapping({} as Record<ImportFieldKey, string | null>);
    setSubmitting(false);
  }

  async function handleFile(file: File) {
    try {
      const sheet = await parseSpreadsheetFile(file);
      if (sheet.rows.length === 0) {
        toast.error("לא נמצאו שורות נתונים בקובץ");
        return;
      }
      setParsed(sheet);
      setMapping(autoMatchColumns(sheet.headers));
    } catch {
      toast.error("קריאת הקובץ נכשלה. ודאי שזה קובץ CSV או Excel תקין");
    }
  }

  async function handleImport() {
    if (!parsed || !mapping.student_name) return;
    setSubmitting(true);
    try {
      const rows = parsed.rows
        .map((row) => buildRowInput(row, mapping))
        .filter((row) => row.student_name.trim() !== "");

      const { inserted, skipped } = await bulkCreateStudents(rows);

      if (inserted > 0) {
        toast.success(
          skipped > 0
            ? `יובאו ${inserted} ${entityLabel.plural} בהצלחה (${skipped} שורות דולגו)`
            : `יובאו ${inserted} ${entityLabel.plural} בהצלחה`
        );
      } else {
        toast.error(`לא יובא אף ${entityLabel.singularMale}. בדקי את המיפוי ואת הנתונים בקובץ`);
      }

      if (inserted > 0) {
        reset();
        onOpenChange(false);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש בייבוא");
    } finally {
      setSubmitting(false);
    }
  }

  const previewRows = parsed
    ? parsed.rows.slice(0, 5).map((row) => buildRowInput(row, mapping))
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[92vh] overflow-y-auto",
          parsed ? "w-[95vw] max-w-6xl sm:max-w-6xl" : "max-w-lg sm:max-w-lg"
        )}
      >

        <DialogHeader>
          <DialogTitle>ייבוא {entityLabel.plural} מקובץ</DialogTitle>
        </DialogHeader>

        {!parsed ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              בחרי קובץ CSV או Excel (.xlsx) עם רשימת {entityLabel.plural}
            </p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="max-w-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">התאמת עמודות</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {importFields.map(({ key, label, required }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {label}
                      {required && " *"}
                    </span>
                    <Select
                      value={mapping[key] ?? NONE}
                      onValueChange={(v) =>
                        setMapping((m) => ({ ...m, [key]: v === NONE ? null : v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) => (value === NONE ? "ללא מיפוי" : value)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>ללא מיפוי</SelectItem>
                        {parsed.headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {!mapping.student_name && (
                <p className="mt-2 text-xs text-destructive">
                  יש למפות את שדה שם {entityLabel.singularDefinite} כדי להמשיך
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">
                תצוגה מקדימה ({parsed.rows.length} שורות בקובץ)
              </h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {PREVIEW_FIELDS.map((key) => (
                        <TableHead key={key}>
                          {importFields.find((f) => f.key === key)?.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i}>
                        {PREVIEW_FIELDS.map((key) => (
                          <TableCell key={key}>{String(row[key] ?? "")}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {parsed && (
            <Button variant="outline" onClick={reset} disabled={submitting}>
              קובץ אחר
            </Button>
          )}
          {parsed && (
            <Button
              onClick={handleImport}
              disabled={submitting || !mapping.student_name}
            >
              {submitting ? "מייבא..." : "ייבוא"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
