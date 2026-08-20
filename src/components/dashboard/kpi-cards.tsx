"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Wallet, CalendarClock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";

export function KpiCards({
  activeStudents,
  totalUnpaid,
  todaysLessonsCount,
  monthPaid,
  monthUnpaid,
}: {
  activeStudents: number;
  totalUnpaid: number;
  todaysLessonsCount: number;
  monthPaid: number;
  monthUnpaid: number;
}) {
  const label = useEntityLabel();
  const sessionLabel = useSessionLabel();
  const cards = [
    {
      label: `${label.plural} פעילים`,
      value: activeStudents.toString(),
      icon: Users,
      accent: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      label: "חוב כולל שלא שולם",
      value: `${totalUnpaid.toFixed(0)} ₪`,
      icon: Wallet,
      accent: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    },
    {
      label: `${sessionLabel.plural} היום`,
      value: todaysLessonsCount.toString(),
      icon: CalendarClock,
      accent: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    },
    {
      label: "הכנסות החודש",
      value: `${monthPaid.toFixed(0)} ₪ שולם`,
      sub: `${monthUnpaid.toFixed(0)} ₪ ממתין`,
      icon: TrendingUp,
      accent: "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-2">
            <div className={cn("flex size-9 items-center justify-center rounded-full", card.accent)}>
              <card.icon className="size-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <div className="text-xl font-semibold">{card.value}</div>
              {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
