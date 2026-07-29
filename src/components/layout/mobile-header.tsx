import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-primary" />
        <span className="font-semibold">CRM למורים פרטיים</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
