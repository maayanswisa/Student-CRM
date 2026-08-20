import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ENTITY_LABEL_KEY, type EntityLabelKey } from "@/lib/entity-label";
import { DEFAULT_SESSION_LABEL_KEY, type SessionLabelKey } from "@/lib/session-label";
import { resolveThemeColor } from "@/lib/theme-color";
import { EntityLabelSettings } from "@/components/settings/entity-label-settings";
import { SessionLabelSettings } from "@/components/settings/session-label-settings";
import { ThemeColorSettings } from "@/components/settings/theme-color-settings";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const entityLabelKey =
    (data.user?.user_metadata?.entity_label as EntityLabelKey | undefined) ??
    DEFAULT_ENTITY_LABEL_KEY;
  const sessionLabelKey =
    (data.user?.user_metadata?.session_label as SessionLabelKey | undefined) ??
    DEFAULT_SESSION_LABEL_KEY;
  const themeColor = resolveThemeColor(data.user?.user_metadata?.theme_color);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">הגדרות</h1>
      <EntityLabelSettings current={entityLabelKey} />
      <SessionLabelSettings current={sessionLabelKey} />
      <ThemeColorSettings current={themeColor} />
      <ChangePasswordForm />
    </div>
  );
}
