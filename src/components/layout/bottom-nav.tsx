"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems, adminNavItem } from "./nav-items";
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const entityLabel = useEntityLabel();
  const sessionLabel = useSessionLabel();
  const navItems = getNavItems(entityLabel, sessionLabel);
  const items = isAdmin ? [...navItems, adminNavItem] : navItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
