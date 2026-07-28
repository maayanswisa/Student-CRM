import { ReportsClient } from "@/components/reports/reports-client";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">דוחות</h1>
      <ReportsClient />
    </div>
  );
}
