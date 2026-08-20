import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { QuickActionFab } from "@/components/lessons/quick-action-fab";
import { EntityLabelProvider } from "@/components/providers/entity-label-provider";
import { SessionLabelProvider } from "@/components/providers/session-label-provider";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { resolveThemeColor } from "@/lib/theme-color";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [{ data: students }, { data: userData }] = await Promise.all([
    supabase.from("students").select("*").eq("status", "active").order("student_name"),
    supabase.auth.getUser(),
  ]);
  const email = userData.user?.email ?? "";
  const isAdmin = isAdminEmail(email);
  const entityLabelKey = userData.user?.user_metadata?.entity_label as string | undefined;
  const sessionLabelKey = userData.user?.user_metadata?.session_label as string | undefined;
  const themeColor = resolveThemeColor(userData.user?.user_metadata?.theme_color);

  return (
    <EntityLabelProvider labelKey={entityLabelKey}>
      <SessionLabelProvider labelKey={sessionLabelKey}>
        <div className="flex min-h-svh" data-accent={themeColor}>
          <Sidebar email={email} isAdmin={isAdmin} />
          <div className="flex-1">
            <MobileHeader email={email} />
            <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-10">
              {children}
            </main>
          </div>
          <QuickActionFab students={students ?? []} />
          <BottomNav isAdmin={isAdmin} />
        </div>
      </SessionLabelProvider>
    </EntityLabelProvider>
  );
}
