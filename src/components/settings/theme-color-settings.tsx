"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { THEME_COLOR_PRESETS, type ThemeColorKey } from "@/lib/theme-color";
import { updateThemeColor } from "@/actions/settings";

export function ThemeColorSettings({ current }: { current: ThemeColorKey }) {
  const router = useRouter();
  const [saving, setSaving] = useState<ThemeColorKey | null>(null);

  async function choose(key: ThemeColorKey) {
    if (key === current) return;
    setSaving(key);
    try {
      await updateThemeColor(key);
      toast.success("הצבע עודכן");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">צבע עיצוב</CardTitle>
        <CardDescription>בחרו את צבע ההדגשה הראשי של המערכת.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {THEME_COLOR_PRESETS.map((preset) => {
          const active = preset.key === current;
          return (
            <button
              key={preset.key}
              type="button"
              disabled={saving !== null}
              onClick={() => choose(preset.key)}
              title={preset.label}
              className={cn(
                "flex size-10 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all disabled:opacity-50",
                active ? "ring-foreground" : "ring-transparent hover:ring-muted-foreground"
              )}
              style={{ backgroundColor: preset.swatch }}
            >
              {active && (
                <Check
                  className="size-4"
                  style={{ color: preset.key === "amber" ? "black" : "white" }}
                />
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
