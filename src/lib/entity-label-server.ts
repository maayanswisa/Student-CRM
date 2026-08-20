import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveEntityLabel, type ResolvedEntityLabel } from "@/lib/entity-label";

export async function getEntityLabelServer(): Promise<ResolvedEntityLabel> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return resolveEntityLabel(data.user?.user_metadata?.entity_label as string | undefined);
}
