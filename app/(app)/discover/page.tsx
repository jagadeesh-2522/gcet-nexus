import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DiscoverClient } from "@/components/discover/discover-client";
import { EmptyState } from "@/components/layout/empty-state";
import type { Project } from "@/lib/types";

export default async function DiscoverPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch projects that are currently recruiting
  const { data: projects } = await supabase
    .from("projects")
    .select("*, leader:profiles!projects_leader_id_fkey(id, full_name, branch, year, avatar_url)")
    .eq("status", "recruiting")
    .order("created_at", { ascending: false })
    .returns<Project[]>();

  const projectIds = (projects ?? []).map((p) => p.id);

  // Fetch user's relationship to these projects
  const [{ data: myRequests }, { data: myMemberships }, { data: mySaves }] = await Promise.all([
    user
      ? supabase
          .from("join_requests")
          .select("project_id, status")
          .eq("applicant_id", user.id)
          .in("project_id", projectIds)
      : Promise.resolve({ data: [] as { project_id: string; status: string }[] }),
    user
      ? supabase
          .from("project_members")
          .select("project_id")
          .eq("profile_id", user.id)
          .in("project_id", projectIds)
      : Promise.resolve({ data: [] as { project_id: string }[] }),
    user
      ? supabase
          .from("saved_projects")
          .select("project_id")
          .eq("profile_id", user.id)
          .in("project_id", projectIds)
      : Promise.resolve({ data: [] as { project_id: string }[] }),
  ]);

  const requestedIds = new Set((myRequests ?? []).filter((r) => r.status === "pending").map((r) => r.project_id));
  const memberIds = new Set((myMemberships ?? []).map((m) => m.project_id));
  const savedIds = new Set((mySaves ?? []).map((s) => s.project_id));

  const hasProjects = projects && projects.length > 0;

  if (!hasProjects) {
    return (
      <div className="mx-auto max-w-6xl">
        {/* Premium Page Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
              <Sparkles className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Discover Projects
            </h1>
          </div>
          <p className="text-base text-muted pl-[52px]">
            Find projects and teams looking for students like you.
          </p>
        </header>

        <EmptyState
          icon={Sparkles}
          title="No projects recruiting right now"
          description="Check back later or create your own project to find teammates."
          actionLabel="Create a project"
          actionHref="/projects/new"
        />
      </div>
    );
  }

  return (
    <DiscoverClient
      projects={projects}
      user={user ? { id: user.id } : null}
      requestedIds={requestedIds}
      memberIds={memberIds}
      savedIds={savedIds}
    />
  );
}
