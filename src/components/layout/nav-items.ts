import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, CalendarClock, CalendarDays, Calendar, FileBarChart } from "lucide-react";

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
  { href: "/calendar", label: "יומן", icon: Calendar },
  { href: "/reports", label: "דוחות", icon: FileBarChart },
];
