import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { buildPaymentReminderLink } from "@/lib/whatsapp";
import { daysSince, type StudentDebt } from "@/lib/debt";
import { cn } from "@/lib/utils";

const AGING_THRESHOLD_DAYS = 30;

export interface StudentDebtRow extends StudentDebt {
  studentId: string;
  studentName: string;
  motherPhone: string;
}

export function UnpaidDebtsList({ debts }: { debts: StudentDebtRow[] }) {
  const sorted = [...debts].sort((a, b) => b.totalOwed - a.totalOwed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">חובות שממתינים לתשלום</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">אין חובות פתוחים כרגע</p>
        )}
        {sorted.map((debt) => {
          const daysOwed = debt.oldestUnpaidDate ? daysSince(debt.oldestUnpaidDate) : 0;
          const isAging = daysOwed > AGING_THRESHOLD_DAYS;
          return (
          <div
            key={debt.studentId}
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3",
              isAging && "border-destructive/40 bg-destructive/5"
            )}
          >
            <div>
              <Link href={`/students/${debt.studentId}`} className="font-medium hover:underline">
                {debt.studentName}
              </Link>
              <div className={cn("text-xs", isAging ? "font-medium text-destructive" : "text-muted-foreground")}>
                {debt.unpaidCount} שיעורים ·{" "}
                {debt.oldestUnpaidDate ? `${daysOwed} ימים בחוב` : ""}
                {isAging && " ⚠ חוב ותיק"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("font-semibold", isAging && "text-destructive")}>
                {debt.totalOwed.toFixed(0)} ₪
              </span>
              <Button
                size="sm"
                variant="secondary"
                nativeButton={false}
                render={
                  <a
                    href={buildPaymentReminderLink({
                      phone: debt.motherPhone,
                      studentName: debt.studentName,
                      unpaidCount: debt.unpaidCount,
                      totalOwed: debt.totalOwed,
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    תזכורת
                  </a>
                }
              />
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
