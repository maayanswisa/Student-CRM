import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Calendar,
  FileBarChart,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/students", label: "תלמידים", icon: Users },
  { href: "/lessons", label: "שיעורים", icon: CalendarClock },
  { href: "/calendar", label: "יומן", icon: Calendar },
  { href: "/reports", label: "דוחות", icon: FileBarChart },
];

export const adminNavItem: NavItem = { href: "/admin", label: "ניהול", icon: ShieldCheck };
