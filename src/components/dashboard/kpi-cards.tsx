import { Card, CardContent } from "@/components/ui/card";
import { Users, Wallet, CalendarClock, TrendingUp } from "lucide-react";

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
  const cards = [
    {
      label: "תלמידים פעילים",
      value: activeStudents.toString(),
      icon: Users,
    },
    {
      label: "חוב כולל שלא שולם",
      value: `${totalUnpaid.toFixed(0)} ₪`,
      icon: Wallet,
    },
    {
      label: "שיעורים היום",
      value: todaysLessonsCount.toString(),
      icon: CalendarClock,
    },
    {
      label: "הכנסות החודש",
      value: `${monthPaid.toFixed(0)} ₪ שולם`,
      sub: `${monthUnpaid.toFixed(0)} ₪ ממתין`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <card.icon className="size-4" />
              <span className="text-xs">{card.label}</span>
            </div>
            <span className="text-xl font-semibold">{card.value}</span>
            {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
