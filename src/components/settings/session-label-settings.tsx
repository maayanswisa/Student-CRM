"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SESSION_LABEL_PRESETS, type SessionLabelKey } from "@/lib/session-label";
import { updateSessionLabel } from "@/actions/settings";

export function SessionLabelSettings({ current }: { current: SessionLabelKey }) {
  const router = useRouter();
  const [saving, setSaving] = useState<SessionLabelKey | null>(null);

  async function choose(key: SessionLabelKey) {
    if (key === current) return;
    setSaving(key);
    try {
      await updateSessionLabel(key);
      toast.success("העדכון נשמר");
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
        <CardTitle className="text-base">איך לקרוא למפגשים</CardTitle>
        <CardDescription>
          הבחירה משפיעה על כל הכיתובים באתר - היומן, הטפסים וההודעות.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {Object.values(SESSION_LABEL_PRESETS).map((preset) => {
          const active = preset.key === current;
          return (
            <button
              key={preset.key}
              type="button"
              disabled={saving !== null}
              onClick={() => choose(preset.key)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted"
              )}
            >
              {saving === preset.key ? "שומר..." : preset.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
