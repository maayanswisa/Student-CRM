// The tutoring week runs Saturday 21:00 -> next Saturday 21:00 (motzei Shabbat
// through the following Shabbat), matching WEEK_DAYS order: א=Sun .. שבת=Sat.
const DAY_OFFSET: Record<string, number> = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  שבת: 7,
};

export function getCurrentWeekStart(now: Date = new Date()): Date {
  const daysSinceSaturday = (now.getDay() + 1) % 7;
  const lastSaturday = new Date(now);
  lastSaturday.setHours(0, 0, 0, 0);
  lastSaturday.setDate(now.getDate() - daysSinceSaturday);
  lastSaturday.setHours(21, 0, 0, 0);
  if (lastSaturday.getTime() > now.getTime()) {
    lastSaturday.setDate(lastSaturday.getDate() - 7);
  }
  return lastSaturday;
}

export function dateForSlot(weekStart: Date, dayLetter: string, time: string | null): Date {
  const offset = DAY_OFFSET[dayLetter] ?? 1;
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + offset);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    if (!Number.isNaN(h)) {
      date.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
      return date;
    }
  }
  date.setHours(12, 0, 0, 0);
  return date;
}

export function todayLetter(now: Date = new Date()): string {
  const map = ["א", "ב", "ג", "ד", "ה", "ו", "שבת"];
  return map[now.getDay()];
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
