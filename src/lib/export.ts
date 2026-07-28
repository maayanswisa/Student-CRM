import * as XLSX from "xlsx";
import type { ReportRow } from "@/actions/reports";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import { LESSON_STATUS_LABELS } from "@/lib/validation/lesson";

function toDisplayRows(rows: ReportRow[]) {
  return rows.map((row) => ({
    תאריך: new Date(row.date).toLocaleDateString("he-IL"),
    "תלמיד/ה": row.studentName,
    "מחיר (ש\"ח)": row.price,
    סטטוס: LESSON_STATUS_LABELS[row.status] ?? row.status,
    שולם: row.isPaid ? "כן" : "לא",
    "אמצעי תשלום": row.paymentMethod ? PAYMENT_METHOD_LABELS[row.paymentMethod] ?? "" : "",
  }));
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(rows: ReportRow[]): string {
  const displayRows = toDisplayRows(rows);
  if (displayRows.length === 0) return "";
  const headers = Object.keys(displayRows[0]);
  const lines = [
    headers.join(","),
    ...displayRows.map((row) => headers.map((h) => csvEscape(row[h as keyof typeof row])).join(",")),
  ];
  return "﻿" + lines.join("\n");
}

export function buildXlsxBlob(rows: ReportRow[]): Blob {
  const displayRows = toDisplayRows(rows);
  const worksheet = XLSX.utils.json_to_sheet(displayRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "דוח חודשי");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
