import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Trophy,
  Edit,
  Github,
  Users,
  Calendar,
  Target,
  MessageSquare,
  ArrowUpRight,
  Crown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, TypeBadge } from "@/components/project/badges";
import { RequestButton, type ViewerRelation } from "@/components/project/request-button";
import { RequestButtonInteractive } from "@/components/project/request-button-interactive";
import { Avatar } from "@/components/ui/avatar";
import { RequestManager } from "@/components/project/request-manager";
import { ProjectActions } from "@/components/project/project-actions";
import type { JoinRequest, Project, ProjectMember, ProjectUpdate } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projectData } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!projectData) {
    notFound();
  }

  const { data: leaderData } = await supabase
    .from("profiles")
    .select("id, full_name, branch, year, avatar_url")
    .eq("id", projectData.leader_id)
    .single();

  const project: Project = {
    ...projectData,
    leader: leaderData || undefined,
  };

  const isLeader = user?.id === project.leader_id;

  const { data: membersData } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", project.id);

  let members: ProjectMember[] = [];
  if (membersData && membersData.length > 0) {
    const memberIds = membersData.map((m) => m.profile_id);
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, branch, year")
      .in("id", memberIds);

    members = membersData.map((m) => ({
      ...m,
      profile: profilesData?.find((p) => p.id === m.profile_id),
    }));
  }

  const { data: updates } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .returns<ProjectUpdate[]>();

  let relation: ViewerRelation = "none";
  if (isLeader) relation = "leader";
  else if (user && members?.some((m) => m.profile_id === user.id)) relation = "member";
  else if (user) {
    const { data: existingRequest } = await supabase
      .from("join_requests")
      .select("status")
      .eq("project_id", project.id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    if (existingRequest?.status === "pending") relation = "requested";
  }

  let pendingRequests: JoinRequest[] = [];
  if (isLeader) {
    const { data: requestsData } = await supabase
      .from("join_requests")
      .select("*")
      .eq("project_id", project.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (requestsData && requestsData.length > 0) {
      const applicantIds = requestsData.map((r) => r.applicant_id);
      const { data: applicantsData } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, avatar_url, branch, year, section, availability, github_url, linkedin_url",
        )
        .in("id", applicantIds);

      pendingRequests = requestsData.map((req) => ({
        ...req,
        applicant: applicantsData?.find((a) => a.id === req.applicant_id),
      }));
    }
  }

  const openSlots = project.max_team_size - project.current_team_size;
  const hasOpenSlots = openSlots > 0;
  const capacityPct = Math.min(100, Math.round((project.current_team_size / project.max_team_size) * 100));

  return (
    <div className="mx-auto max-w-6xl">
      {/* ═══════ HERO ═══════ */}
      <section className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-80" />
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-accent/[0.04] blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          {isLeader && (
            <div className="mb-6 flex justify-end gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2 hover:border-border-strong"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <ProjectActions projectId={project.id} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <TypeBadge type={project.type} />
            <StatusBadge status={project.status} />
            {project.deadline && (
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2/60 px-2.5 py-1 text-[11.5px] text-muted">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
          </div>

          <h1 className="font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[40px] lg:text-[46px] text-balance">
            {project.name}
          </h1>

          <p className="mt-4 max-w-3xl text-[16.5px] leading-relaxed text-muted sm:text-[17.5px] sm:leading-relaxed text-balance">
            {project.short_description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {project.leader && (
              <Link
                href={`/profile/${project.leader.id}`}
                className="group inline-flex items-center gap-3"
              >
                <div className="relative">
                  <Avatar
                    src={project.leader.avatar_url}
                    alt={project.leader.full_name}
                    fallback={project.leader.full_name}
                    size="md"
                  />
                  <div className="absolute -right-1 -bottom-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-surface bg-warning/[0.92] text-[9px] font-bold text-white shadow-xs">
                    <Crown className="h-2.5 w-2.5" strokeWidth={2.75} />
                  </div>
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
                    {project.leader.full_name}
                  </p>
                  <p className="text-[12px] leading-tight text-muted">
                    {project.leader.branch} · Year {project.leader.year}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {project.hackathon_name && (
            <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-accent/15 bg-accent/[0.06] px-4 py-3">
              <Trophy className="h-4.5 w-4.5 shrink-0 text-accent" />
              <div className="flex items-baseline gap-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-accent/70">
                  Hackathon
                </p>
                {project.hackathon_url ? (
                  <a
                    href={project.hackathon_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] font-semibold text-accent transition-colors hover:underline"
                  >
                    {project.hackathon_name}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-[14px] font-semibold text-accent">{project.hackathon_name}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ MAIN GRID ═══════ */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column */}
        <div className="space-y-12 min-w-0">
          {project.full_description && (
            <section>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
                <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                  About
                </h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line text-[15px] leading-[1.75] text-foreground/82">
                  {project.full_description}
                </p>
              </div>
            </section>
          )}

          {project.tech_stack.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
                <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                  Tech Stack
                </h2>
                <span className="text-[12px] text-muted">· {project.tech_stack.length} technologies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className={cn(
                      "inline-flex items-center rounded-md border border-border bg-surface px-3 py-[6px] text-[13px] font-medium text-foreground shadow-xs",
                      "transition-all duration-150 hover:border-accent/30 hover:bg-surface-2",
                    )}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {project.required_roles.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
                <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                  Looking for
                </h2>
                {hasOpenSlots && (
                  <span className="inline-flex items-center rounded-full bg-success/[0.09] px-2.5 py-[3px] text-[11.5px] font-semibold text-success">
                    {openSlots} open {openSlots === 1 ? "spot" : "spots"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.required_roles.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      "inline-flex items-center rounded-md border border-accent/25 bg-accent/[0.08] px-3.5 py-[7px] text-[13.5px] font-semibold text-accent",
                      "transition-colors hover:border-accent/45 hover:bg-accent/[0.12]",
                    )}
                  >
                    <Users className="mr-1.5 h-3.5 w-3.5" strokeWidth={2.25} />
                    {role}
                  </span>
                ))}
              </div>
            </section>
          )}

          {project.external_url && (
            <section>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
                <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                  Repository
                </h2>
              </div>
              <a
                href={project.external_url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "group inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-3.5 text-[14px] font-semibold text-foreground shadow-xs",
                  "transition-all duration-150 hover:border-accent/30 hover:bg-surface-2 hover:shadow-sm",
                )}
              >
                <Github className="h-4.5 w-4.5 text-foreground/70" />
                <span>View source code</span>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
              </a>
            </section>
          )}

          {isLeader && pendingRequests.length > 0 && (
            <section className="border-t border-border pt-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
                <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                  Join Requests
                </h2>
                <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent/[0.12] px-2 text-[11.5px] font-bold text-accent">
                  {pendingRequests.length}
                </span>
              </div>
              <RequestManager projectId={project.id} requests={pendingRequests} />
            </section>
          )}

          {/* Project Updates */}
          <section className="border-t border-border pt-12">
            <div className="mb-6 flex items-center gap-2.5">
              <div className="h-[18px] w-[3px] rounded-full bg-accent/70" />
              <h2 className="font-display text-[20px] font-semibold tracking-tight text-foreground">
                Activity
              </h2>
              {updates && updates.length > 0 && (
                <span className="text-[12px] text-muted">· {updates.length} update{updates.length === 1 ? "" : "s"}</span>
              )}
            </div>

            {updates && updates.length > 0 ? (
              <div className="relative space-y-4 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {updates.map((u, idx) => (
                  <div key={u.id} className="relative flex gap-4 pl-0">
                    <div className="relative z-10 mt-1.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-xs">
                      <MessageSquare className="h-4 w-4 text-accent" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted mb-2">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="rounded-xl border border-border bg-surface p-4.5 shadow-xs">
                        <p className="text-[14.5px] leading-[1.7] text-foreground/85 whitespace-pre-line">
                          {u.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface/40 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                  <MessageSquare className="h-5 w-5 text-muted" strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-[14px] font-medium text-foreground">No updates yet</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Project activity and progress updates will appear here
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {relation !== "leader" && relation !== "member" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Team capacity
                    </p>
                    <p className="mt-1 font-display text-[22px] font-semibold leading-none text-foreground tabular-nums">
                      {project.current_team_size}
                      <span className="mx-0.5 text-muted font-normal text-[16px]">/</span>
                      <span className="text-muted font-medium text-[17px]">{project.max_team_size}</span>
                    </p>
                  </div>
                  {hasOpenSlots && (
                    <span className="inline-flex items-center rounded-full bg-success/[0.09] px-2.5 py-1 text-[11.5px] font-semibold text-success">
                      {openSlots} {openSlots === 1 ? "spot" : "spots"}
                    </span>
                  )}
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent via-accent to-accent/70 transition-all duration-500"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>

                <div className="mt-5">
                  {relation === "requested" ? (
                    <div>
                      <button
                        disabled
                        className="btn-secondary w-full cursor-not-allowed opacity-75 h-11 text-[14px]"
                      >
                        Request Sent
                      </button>
                      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
                        The project leader will review your request
                      </p>
                    </div>
                  ) : project.status !== "recruiting" ? (
                    <div>
                      <button
                        disabled
                        className="btn-secondary w-full cursor-not-allowed opacity-75 h-11 text-[14px]"
                      >
                        Recruitment Closed
                      </button>
                      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
                        This project is not accepting new members
                      </p>
                    </div>
                  ) : (
                    <RequestButton
                      projectId={project.id}
                      status={project.status}
                      relation={relation}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {relation === "leader" && (
            <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/[0.06] to-transparent p-5 shadow-xs">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-accent/75">
                Leader view
              </p>
              <p className="mt-2 text-[14.5px] font-semibold leading-snug text-foreground">
                You own this project
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Manage your team and review join requests from the sections above.
              </p>
            </div>
          )}

          {relation === "member" && (
            <div className="rounded-2xl border border-success/15 bg-gradient-to-br from-success/[0.05] to-transparent p-5 shadow-xs">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-success/80">
                You're on the team
              </p>
              <p className="mt-2 text-[14.5px] font-semibold leading-snug text-foreground">
                Welcome aboard
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                You're collaborating with {project.current_team_size - 1} other student{project.current_team_size === 2 ? "" : "s"}.
              </p>
            </div>
          )}

          {/* Team Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                Team
              </p>
              <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-surface-3 px-2 text-[11.5px] font-semibold text-muted">
                {members.length + 1}
              </span>
            </div>

            <div className="p-4">
              <div className="space-y-0.5">
                {project.leader && (
                  <Link
                    href={`/profile/${project.leader.id}`}
                    className={cn(
                      "group flex items-center gap-3 rounded-md p-2 transition-all duration-150",
                      "bg-warning/[0.04] hover:bg-warning/[0.08]",
                    )}
                  >
                    <div className="relative">
                      <Avatar
                        src={project.leader.avatar_url}
                        alt={project.leader.full_name}
                        fallback={project.leader.full_name}
                        size="sm"
                      />
                      <div className="absolute -right-0.5 -bottom-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-surface bg-warning text-[8px] font-bold text-white">
                        <Crown className="h-2 w-2" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-foreground transition-colors group-hover:text-accent">
                        {project.leader.full_name}
                      </p>
                      <p className="truncate text-[11.5px] text-warning/90">
                        Lead · {project.leader.branch}
                      </p>
                    </div>
                  </Link>
                )}

                {members.length > 0 ? (
                  members.map((m) => (
                    <Link
                      key={m.profile_id}
                      href={`/profile/${m.profile_id}`}
                      className={cn(
                        "group flex items-center gap-3 rounded-md p-2 transition-all duration-150",
                        "hover:bg-surface-3",
                      )}
                    >
                      <Avatar
                        src={m.profile?.avatar_url}
                        alt={m.profile?.full_name ?? "Member"}
                        fallback={m.profile?.full_name ?? "?"}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-foreground transition-colors group-hover:text-accent">
                          {m.profile?.full_name}
                        </p>
                        <p className="truncate text-[11.5px] text-muted">
                          {m.role ?? "Member"} · {m.profile?.branch}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  project.leader && (
                    <div className="px-2 py-3 text-[12px] text-muted">
                      No other team members yet
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <RequestButtonInteractive
        projectId={project.id}
        status={project.status}
        relation={relation}
      />
    </div>
  );
}
