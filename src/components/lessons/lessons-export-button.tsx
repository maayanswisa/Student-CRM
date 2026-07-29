"use client";

import { ExportMenuButton } from "@/components/shared/export-menu-button";
import { getLessonsExportRows } from "@/actions/lessons";
import { buildCsv, buildXlsxBlob, downloadBlob } from "@/lib/export";

export function LessonsExportButton() {
  async function exportCsv() {
    const rows = await getLessonsExportRows();
    downloadBlob(new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" }), "שיעורים.csv");
  }

  async function exportXlsx() {
    const rows = await getLessonsExportRows();
    downloadBlob(buildXlsxBlob(rows, "שיעורים"), "שיעורים.xlsx");
  }

  return (
    <ExportMenuButton label="ייצוא שיעורים" onExportCsv={exportCsv} onExportXlsx={exportXlsx} />
  );
}
