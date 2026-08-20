import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveSessionLabel, type ResolvedSessionLabel } from "@/lib/session-label";

export async function getSessionLabelServer(): Promise<ResolvedSessionLabel> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return resolveSessionLabel(data.user?.user_metadata?.session_label as string | undefined);
}
