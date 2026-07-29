import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { QuickActionFab } from "@/components/lessons/quick-action-fab";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="flex min-h-svh">
      <Sidebar email={email} />
      <div className="flex-1">
        <MobileHeader email={email} />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-10">
          {children}
        </main>
      </div>
      <QuickActionFab students={students ?? []} />
      <BottomNav />
    </div>
  );
}
