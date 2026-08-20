import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Calendar,
  FileBarChart,
  ShieldCheck,
} from "lucide-react";
import type { ResolvedEntityLabel } from "@/lib/entity-label";
import type { ResolvedSessionLabel } from "@/lib/session-label";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function getNavItems(
  entityLabel: ResolvedEntityLabel,
  sessionLabel: ResolvedSessionLabel
): NavItem[] {
  return [
    { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
    { href: "/students", label: entityLabel.plural, icon: Users },
    { href: "/lessons", label: sessionLabel.plural, icon: CalendarClock },
    { href: "/calendar", label: "יומן", icon: Calendar },
    { href: "/reports", label: "דוחות", icon: FileBarChart },
  ];
}

export const adminNavItem: NavItem = { href: "/admin", label: "ניהול", icon: ShieldCheck };
