"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItems, adminNavItem } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";

export function Sidebar({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const entityLabel = useEntityLabel();
  const sessionLabel = useSessionLabel();
  const navItems = getNavItems(entityLabel, sessionLabel);
  const items = isAdmin ? [...navItems, adminNavItem] : navItems;

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-e md:bg-sidebar md:text-sidebar-foreground">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="font-semibold">CRM למורים פרטיים</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
