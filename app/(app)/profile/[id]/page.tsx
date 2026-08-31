import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Globe,
  Mail,
  Calendar,
  Settings,
  ExternalLink,
  MessageCirclePlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PortfolioSection } from "@/components/profile/portfolio-section";
import { Avatar } from "@/components/ui/avatar";
import type { Profile, Project, ProjectMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const availabilityConfig = {
  open: {
    label: "Open to collaborate",
    chip: "border-success/25 bg-success/[0.08] text-success",
    dot: "bg-success",
  },
  limited: {
    label: "Limited availability",
    chip: "border-accent/25 bg-accent/[0.08] text-accent",
    dot: "bg-accent",
  },
  unavailable: {
    label: "Not available",
    chip: "border-muted-2 bg-surface-2 text-muted",
    dot: "bg-muted",
  },
} as const;

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single<Profile>();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = user?.id === profile.id;

  const { data: ledProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("leader_id", profile.id);

  const { data: membershipData } = await supabase
    .from("project_members")
    .select("*")
    .eq("profile_id", profile.id);

  let memberProjects: Project[] = [];
  if (membershipData && membershipData.length > 0) {
    const projectIds = membershipData.map((m) => m.project_id);
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .in("id", projectIds);
    memberProjects = projectsData || [];
  }

  const allProjectIds = new Set<string>();
  const projectMap = new Map<
    string,
    { project: Project; role: "lead" | "member"; membership?: ProjectMember }
  >();

  if (ledProjects) {
    ledProjects.forEach((p) => {
      const projectTyped: Project = p;
      projectMap.set(projectTyped.id, { project: projectTyped, role: "lead" });
      allProjectIds.add(projectTyped.id);
    });
  }

  memberProjects.forEach((p) => {
    if (!projectMap.has(p.id)) {
      const membership = membershipData?.find((m) => m.project_id === p.id);
      projectMap.set(p.id, { project: p, role: "member", membership });
    }
  });

  const avStyle = availabilityConfig[profile.availability];

  const hasSocial = profile.github_url || profile.linkedin_url || profile.portfolio_url;

  return (
    <div className="mx-auto max-w-4xl">
      {/* ═══════ PROFILE HEADER CARD ═══════ */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-accent/[0.04] blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="p-[3px] rounded-2xl bg-gradient-to-br from-accent/35 via-transparent to-accent/20 shadow-sm">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  fallback={profile.full_name}
                  size="2xl"
                />
              </div>
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-display text-[26px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[30px]">
                      {profile.full_name}
                    </h1>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-[5px] text-[11.5px] font-medium",
                        avStyle.chip,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", avStyle.dot)} />
                      {avStyle.label}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-muted">
                    <span className="font-medium text-foreground/85">{profile.branch}</span>
                    <span className="text-border-strong">·</span>
                    <span>Year {profile.year}</span>
                    {profile.section && (
                      <>
                        <span className="text-border-strong">·</span>
                        <span>Section {profile.section}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isOwnProfile ? (
                    <Link
                      href="/settings"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-foreground",
                        "transition-colors hover:bg-surface-2 hover:border-border-strong",
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Link>
                  ) : (
                    profile.availability === "open" && (
                      <Link
                        href={`/discover?creator=${profile.id}`}
                        className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-[13px]"
                      >
                        <MessageCirclePlus className="h-4 w-4" />
                        <span>Collaborate</span>
                      </Link>
                    )
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="mt-5 text-[14.5px] leading-[1.75] text-foreground/82 whitespace-pre-line text-pretty">
                  {profile.bio}
                </p>
              )}

              {hasSocial && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-foreground",
                        "transition-colors hover:bg-surface-2 hover:border-border-strong",
                      )}
                    >
                      <Github className="h-3.5 w-3.5 text-foreground/70" />
                      GitHub
                      <ExternalLink className="h-3 w-3 text-muted" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-foreground",
                        "transition-colors hover:bg-surface-2 hover:border-border-strong",
                      )}
                    >
                      <Linkedin className="h-3.5 w-3.5 text-foreground/70" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 text-muted" />
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-foreground",
                        "transition-colors hover:bg-surface-2 hover:border-border-strong",
                      )}
                    >
                      <Globe className="h-3.5 w-3.5 text-foreground/70" />
                      Portfolio
                      <ExternalLink className="h-3 w-3 text-muted" />
                    </a>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted border-t border-border/70 pt-4">
                <div className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile.email}</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-foreground/85 tabular-nums">{projectMap.size}</span>
                  <span>project{projectMap.size === 1 ? "" : "s"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <PortfolioSection projects={Array.from(projectMap.values())} />
    </div>
  );
}
