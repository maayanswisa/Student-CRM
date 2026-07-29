import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, CalendarClock, CalendarDays, FileBarChart } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/students", label: "תלמידים", icon: Users },
  { href: "/lessons", label: "שיעורים", icon: CalendarClock },
  { href: "/schedule", label: "שיעורים השבוע", icon: CalendarDays },
  { href: "/reports", label: "דוחות", icon: FileBarChart },
];
