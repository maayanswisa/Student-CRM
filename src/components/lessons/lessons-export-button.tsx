"use client";

import { ExportMenuButton } from "@/components/shared/export-menu-button";
import { getLessonsExportRows } from "@/actions/lessons";
import { buildCsv, buildXlsxBlob, downloadBlob } from "@/lib/export";
import { useSessionLabel } from "@/components/providers/session-label-provider";

export function LessonsExportButton() {
  const sessionLabel = useSessionLabel();

  async function exportCsv() {
    const rows = await getLessonsExportRows();
    downloadBlob(
      new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" }),
      `${sessionLabel.plural}.csv`
    );
  }

  async function exportXlsx() {
    const rows = await getLessonsExportRows();
    downloadBlob(buildXlsxBlob(rows, sessionLabel.plural), `${sessionLabel.plural}.xlsx`);
  }

  return (
    <ExportMenuButton
      label={`ייצוא ${sessionLabel.plural}`}
      onExportCsv={exportCsv}
      onExportXlsx={exportXlsx}
    />
  );
}
