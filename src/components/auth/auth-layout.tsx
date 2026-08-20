import {
  BarChart3,
  Briefcase,
  CalendarClock,
  CalendarDays,
  FileSpreadsheet,
  ListFilter,
  MessageCircle,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "ניהול לקוחות",
    description: "כל הפרטים, הפגישות וההתקדמות של כל לקוח/ה במקום אחד.",
  },
  {
    icon: CalendarClock,
    title: "יומן פגישות חכם",
    description: "מעקב אחר פגישות היום, השבוע והחודש בלי להתבלבל.",
  },
  {
    icon: ReceiptText,
    title: "מעקב תשלומים וחובות",
    description: "דעו בדיוק מי שילם, מי חייב וכמה - בלחיצה אחת.",
  },
];

const previewLessons = [
  { name: "מעיין", time: "14:00", status: "הושלם" },
  { name: "נועה", time: "16:30", status: "מתוכנן" },
];

const previewStudents = [
  { initials: "מ", name: "מעיין", subject: "מתמטיקה" },
  { initials: "נ", name: "נועה", subject: "ייעוץ זוגי" },
  { initials: "ת", name: "תומר", subject: "טיפול רגשי" },
];

const previewDebts = [
  { name: "איתי", amount: "320 ₪" },
  { name: "שירה", amount: "150 ₪" },
];

const moreCapabilities = [
  { icon: FileSpreadsheet, label: "ייבוא וייצוא לקוחות (Excel/CSV)" },
  { icon: ListFilter, label: "סינון וחיפוש מהיר לפי סטטוס וקטגוריה" },
  { icon: MessageCircle, label: "תזכורות ועדכונים אוטומטיים בוואטסאפ" },
  { icon: TrendingUp, label: "מעקב התקדמות לאורך זמן" },
  { icon: BarChart3, label: "דוחות חודשיים מפורטים עם ייצוא" },
  { icon: CalendarDays, label: "יומן שבועי וחודשי מלא" },
];

function MockupWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-right shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-yellow-400/70" />
          <span className="size-2.5 rounded-full bg-green-400/70" />
        </div>
        <span className="text-xs font-medium text-white/50">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl sm:size-96" />
        <div className="absolute -left-24 bottom-0 size-72 rounded-full bg-sky-500/20 blur-3xl sm:size-96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-4xl flex-col items-center gap-10 px-4 py-12 text-center sm:px-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <Briefcase className="size-5" />
            </div>
            <span className="text-lg font-semibold">My CRM</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl">
              כל הלקוחות, הפגישות והתשלומים - במקום אחד מסודר
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
              מערכת ה-CRM שנבנתה במיוחד עבור בעלי ובעלות מקצוע עצמאיים - מורים,
              מטפלים, יועצים ועוד - כדי לחסוך לכם זמן ולתת שליטה מלאה על העסק -
              בלי בלגן של אקסלים ופתקים.
            </p>
          </div>

          <div className="w-full max-w-sm shrink-0 text-right">{children}</div>

          <ul className="grid w-full gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex flex-col items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-5" />
                </div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-white/60">{description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-white/50">
            ככה זה נראה בפנים
          </p>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <MockupWindow title="לוח בקרה">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/50">לקוחות פעילים</p>
                  <p className="text-xl font-bold">15</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/50">הכנסות החודש</p>
                  <p className="text-xl font-bold">1,865 ₪</p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {previewLessons.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <span>{row.name}</span>
                    <span className="text-white/50">{row.time}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </MockupWindow>

            <MockupWindow title="ניהול לקוחות">
              <div className="flex flex-col gap-2">
                {previewStudents.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-semibold">
                      {s.initials}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-white/50">{s.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </MockupWindow>

            <MockupWindow title="מעקב תשלומים">
              <div className="flex flex-col gap-2">
                {previewDebts.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <span>{d.name}</span>
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                      חוב: {d.amount}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
                  <span>מעיין</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    שולם
                  </span>
                </div>
              </div>
            </MockupWindow>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-white/50">ועוד הרבה יותר</p>
          <ul className="flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {moreCapabilities.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                <Icon className="size-4 text-white/50" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
