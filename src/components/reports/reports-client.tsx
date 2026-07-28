"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { getMonthlyReport, type ReportRow } from "@/actions/reports";
import { buildCsv, buildXlsxBlob, downloadBlob } from "@/lib/export";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function ReportsClient() {
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getMonthlyReport(month);
      setRows(data);
    });
  }, [month]);

  const totalPaid = rows.filter((r) => r.isPaid).reduce((s, r) => s + r.price, 0);
  const totalUnpaid = rows.filter((r) => !r.isPaid && r.status === "completed").reduce((s, r) => s + r.price, 0);

  function exportCsv() {
    const csv = buildCsv(rows);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `דוח-${month}.csv`);
  }

  function exportXlsx() {
    const blob = buildXlsxBlob(rows);
    downloadBlob(blob, `דוח-${month}.xlsx`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">בחירת חודש</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-auto"
          />
          <Button variant="secondary" disabled={rows.length === 0} onClick={exportCsv}>
            <Download className="size-4" />
            ייצוא ל-CSV
          </Button>
          <Button variant="secondary" disabled={rows.length === 0} onClick={exportXlsx}>
            <FileSpreadsheet className="size-4" />
            ייצוא ל-Excel
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">שיעורים בחודש</p>
            <p className="text-xl font-semibold">{isPending ? "..." : rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">שולם</p>
            <p className="text-xl font-semibold">{isPending ? "..." : `${totalPaid.toFixed(0)} ₪`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">ממתין לתשלום</p>
            <p className="text-xl font-semibold">{isPending ? "..." : `${totalUnpaid.toFixed(0)} ₪`}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
