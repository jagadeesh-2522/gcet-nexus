import { Folders, Crown, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/project/project-card";
import { EmptyState } from "@/components/layout/empty-state";
import type { Project } from "@/lib/types";
import type { ViewerRelation } from "@/components/project/request-button";

export default async function MyProjectsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <EmptyState icon={Folders} title="Not logged in" description="Please log in to view your projects." />;
  }

  // Fetch projects where user is the leader
  const { data: ledProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("leader_id", user.id)
    .order("updated_at", { ascending: false })
    .returns<Project[]>();

  // Fetch projects where user is a member
  const { data: membershipData } = await supabase
    .from("project_members")
    .select("*")
    .eq("profile_id", user.id);

  let memberProjects: Project[] = [];
  if (membershipData && membershipData.length > 0) {
    const projectIds = membershipData.map((m) => m.project_id);
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .in("id", projectIds)
      .order("updated_at", { ascending: false })
      .returns<Project[]>();
    memberProjects = projectsData || [];
  }

  // Separate led and member-only projects
  const ledProjectIds = new Set((ledProjects || []).map(p => p.id));
  const memberOnlyProjects = memberProjects.filter(p => !ledProjectIds.has(p.id));
  
  const allProjects = [...(ledProjects || []), ...memberOnlyProjects];

  if (allProjects.length === 0) {
    return (
      <div className="mx-auto max-w-6xl">
        {/* Premium Page Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
              <Folders className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              My Projects
            </h1>
          </div>
          <p className="text-base text-muted pl-[52px]">
            Projects you lead or are a member of.
          </p>
        </header>

        <EmptyState
          icon={Folders}
          title="No projects yet"
          description="Start by creating a new project or joining existing ones from Discover."
          actionLabel="Discover projects"
          actionHref="/discover"
        />
      </div>
    );
  }

  // Fetch leader profiles for display
  const leaderIds = new Set<string>();
  allProjects.forEach((p) => {
    leaderIds.add(p.leader_id);
  });

  const { data: leaderProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, branch, year, avatar_url")
    .in("id", Array.from(leaderIds));

  // Hydrate leader data
  const leaderMap = new Map(leaderProfiles?.map((p) => [p.id, p]) || []);
  allProjects.forEach((p) => {
    if (leaderMap.has(p.leader_id)) {
      p.leader = leaderMap.get(p.leader_id);
    }
  });

  // Determine viewer relation to each project
  const projectIds = allProjects.map((p) => p.id);

  const [{ data: myRequests }, { data: myMemberships }, { data: mySaves }] = await Promise.all([
    supabase
      .from("join_requests")
      .select("project_id, status")
      .eq("applicant_id", user.id)
      .in("project_id", projectIds),
    supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", user.id)
      .in("project_id", projectIds),
    supabase
      .from("saved_projects")
      .select("project_id")
      .eq("profile_id", user.id)
      .in("project_id", projectIds),
  ]);

  const requestedIds = new Set((myRequests ?? []).filter((r) => r.status === "pending").map((r) => r.project_id));
  const memberIds = new Set((myMemberships ?? []).map((m) => m.project_id));
  const savedIds = new Set((mySaves ?? []).map((s) => s.project_id));

  const relationMap = (projectId: string): ViewerRelation => {
    if (allProjects.find((p) => p.id === projectId)?.leader_id === user.id) return "leader";
    if (memberIds.has(projectId)) return "member";
    if (requestedIds.has(projectId)) return "requested";
    return "none";
  };

  const leadingCount = ledProjects?.length || 0;
  const collaboratingCount = memberOnlyProjects.length;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Premium Page Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <Folders className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            My Projects
          </h1>
        </div>
        <p className="text-base text-muted pl-[52px]">
          Projects you lead or are a member of.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Total Projects</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {allProjects.length}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <Folders className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Leading</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {leadingCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
              <Crown className="h-5 w-5 text-warning" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Collaborating</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {collaboratingCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
              <Users2 className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Sections */}
      {ledProjects && ledProjects.length > 0 && (
        <section className="mb-10">
          <div className="mb-5 flex items-center gap-2">
            <Crown className="h-4 w-4 text-warning" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Projects I Lead
            </h2>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
              {leadingCount}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ledProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                relation={relationMap(project.id)}
                saved={savedIds.has(project.id)}
              />
            ))}
          </div>
        </section>
      )}

      {memberOnlyProjects.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Users2 className="h-4 w-4 text-success" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Projects I'm Part Of
            </h2>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
              {collaboratingCount}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {memberOnlyProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                relation={relationMap(project.id)}
                saved={savedIds.has(project.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
