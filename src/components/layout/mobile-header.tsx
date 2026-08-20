import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function MobileHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-primary" />
        <span className="font-semibold">MyCRM</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
