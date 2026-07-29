import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, GraduationCap, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminKpiCards({
  totalTeachers,
  newThisWeek,
  newThisMonth,
  totalActiveStudents,
  totalLessons,
}: {
  totalTeachers: number;
  newThisWeek: number;
  newThisMonth: number;
  totalActiveStudents: number;
  totalLessons: number;
}) {
  const cards = [
    {
      label: "סה\"כ מורים רשומים",
      value: totalTeachers.toString(),
      sub: `${newThisWeek} השבוע · ${newThisMonth} החודש`,
      icon: Users,
      accent: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      label: "מורים חדשים החודש",
      value: newThisMonth.toString(),
      icon: UserPlus,
      accent: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    },
    {
      label: "תלמידים פעילים בפלטפורמה",
      value: totalActiveStudents.toString(),
      icon: GraduationCap,
      accent: "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    },
    {
      label: "שיעורים שנרשמו בפלטפורמה",
      value: totalLessons.toString(),
      icon: CalendarClock,
      accent: "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
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
