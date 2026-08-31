import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar unreadNotifications={unreadCount} userId={user?.id} />
      <main className="mx-auto max-w-app px-5 py-8 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
