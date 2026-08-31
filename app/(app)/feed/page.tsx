import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ActivityCard } from "@/components/feed/activity-card";
import { EmptyState } from "@/components/layout/empty-state";
import type { ActivityFeedItem } from "@/lib/types";

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch activity data from all sources
  const [projectsData, membersData, updatesData] = await Promise.all([
    // Activity type 1: Projects created
    supabase
      .from("projects")
      .select("id, name, type, tech_stack, created_at, leader_id")
      .order("created_at", { ascending: false })
      .limit(50),

    // Activity type 2: Members joined
    supabase
      .from("project_members")
      .select("project_id, profile_id, role, joined_at")
      .order("joined_at", { ascending: false })
      .limit(50),

    // Activity type 3: Project updates posted
    supabase
      .from("project_updates")
      .select("project_id, author_id, body, created_at")
      .order("created_at", { ascending: false})
      .limit(50),
  ]);

  // Collect all unique profile IDs and project IDs for bulk fetching
  const profileIds = new Set<string>();
  const projectIds = new Set<string>();

  // From projects
  projectsData.data?.forEach((p) => {
    profileIds.add(p.leader_id);
    projectIds.add(p.id);
  });

  // From members
  membersData.data?.forEach((m) => {
    profileIds.add(m.profile_id);
    projectIds.add(m.project_id);
  });

  // From updates
  updatesData.data?.forEach((u) => {
    profileIds.add(u.author_id);
    projectIds.add(u.project_id);
  });

  // Bulk fetch all profiles and projects
  const [{ data: profiles }, { data: projects }] = await Promise.all([
    profileIds.size > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, branch, year, avatar_url")
          .in("id", Array.from(profileIds))
      : Promise.resolve({ data: [] }),
    projectIds.size > 0
      ? supabase
          .from("projects")
          .select("id, name, type, tech_stack")
          .in("id", Array.from(projectIds))
      : Promise.resolve({ data: [] }),
  ]);

  // Create maps for quick lookup
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
  const projectMap = new Map(projects?.map((p) => [p.id, p]) || []);

  // Build activity items
  const activities: ActivityFeedItem[] = [];

  // Type 1: Project created
  projectsData.data?.forEach((p) => {
    const actor = profileMap.get(p.leader_id);
    if (actor) {
      activities.push({
        id: `project-created-${p.id}`,
        type: "project_created",
        actor,
        project: projectMap.get(p.id) || { id: p.id, name: p.name, type: p.type, tech_stack: p.tech_stack },
        timestamp: p.created_at,
      });
    }
  });

  // Type 2: Member joined
  membersData.data?.forEach((m) => {
    const actor = profileMap.get(m.profile_id);
    const project = projectMap.get(m.project_id);
    if (actor && project) {
      activities.push({
        id: `member-joined-${m.project_id}-${m.profile_id}`,
        type: "member_joined",
        actor,
        project,
        timestamp: m.joined_at,
        context: m.role ? { memberRole: m.role } : undefined,
      });
    }
  });

  // Type 3: Update posted
  updatesData.data?.forEach((u) => {
    const actor = profileMap.get(u.author_id);
    const project = projectMap.get(u.project_id);
    if (actor && project) {
      activities.push({
        id: `update-posted-${u.project_id}-${u.author_id}`,
        type: "update_posted",
        actor,
        project,
        timestamp: u.created_at,
        context: { updateBody: u.body },
      });
    }
  });

  // Sort all activities by timestamp descending (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const hasActivity = activities.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Premium Page Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <Zap className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Feed
          </h1>
        </div>
        <p className="text-base text-muted pl-[52px]">
          What GCET is building right now.
        </p>
      </header>

      {!hasActivity ? (
        <EmptyState
          icon={Zap}
          title="No activity yet"
          description="Project activity will appear here as students build and collaborate."
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
