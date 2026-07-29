import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

export function StudentAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const initial = name.trim().charAt(0) || "?";

  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn(colorFor(name), "font-medium")}>{initial}</AvatarFallback>
    </Avatar>
  );
}
