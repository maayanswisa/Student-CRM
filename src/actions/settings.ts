"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ENTITY_LABEL_PRESETS, type EntityLabelKey } from "@/lib/entity-label";
import { SESSION_LABEL_PRESETS, type SessionLabelKey } from "@/lib/session-label";
import { THEME_COLOR_PRESETS, type ThemeColorKey } from "@/lib/theme-color";

export async function updateEntityLabel(key: EntityLabelKey) {
  if (!(key in ENTITY_LABEL_PRESETS)) throw new Error("ערך לא תקין");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { entity_label: key } });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateSessionLabel(key: SessionLabelKey) {
  if (!(key in SESSION_LABEL_PRESETS)) throw new Error("ערך לא תקין");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { session_label: key } });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateThemeColor(key: ThemeColorKey) {
  if (!THEME_COLOR_PRESETS.some((p) => p.key === key)) throw new Error("ערך לא תקין");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { theme_color: key } });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) {
    return { error: "יש להזין סיסמה חדשה" };
  }
  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }
  if (password !== confirmPassword) {
    return { error: "הסיסמאות אינן תואמות" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: `שגיאה: ${error.message}` };
  }

  return { success: true };
}
