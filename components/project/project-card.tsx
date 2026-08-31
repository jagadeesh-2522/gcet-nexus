import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Share2, Trophy, Users2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { StatusBadge, TypeBadge } from "./badges";
import { RequestButton, type ViewerRelation } from "./request-button";
import { Avatar } from "@/components/ui/avatar";

export function ProjectCard({
  project,
  relation,
  saved,
  onSave,
}: {
  project: Project;
  relation: ViewerRelation;
  saved?: boolean;
  onSave?: () => void;
}) {
  const leaderInitials = project.leader?.full_name
    ? project.leader.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 ease-out hover:border-border-strong hover:shadow-sm hover:-translate-y-0.5">
      {/* Top accent bar — subtle highlight on hover */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-transparent transition-all duration-300 ease-out group-hover:bg-accent/50"
        aria-hidden="true"
      />

      {/* HEADER: Leader + Title + Actions */}
      <div className="flex items-start gap-3 p-5 pb-0">
        {/* Leader avatar — compact layout */}
        {project.leader && (
          <Link
            href={`/profile/${project.leader.id}`}
            className="shrink-0 -mt-0.5 focus-ring rounded-full"
            tabIndex={-1}
          >
            <Avatar
              src={project.leader.avatar_url}
              alt={project.leader.full_name}
              fallback={project.leader.full_name}
              size="sm"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/projects/${project.id}`} className="block -mx-1 -my-1 rounded-md px-1 outline-none focus-visible:ring-[2px] focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
                <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                  {project.name}
                </h3>
              </Link>
              {project.leader && (
                <Link
                  href={`/profile/${project.leader.id}`}
                  className="mt-0.5 block truncate text-xs text-muted transition-colors hover:text-accent"
                >
                  <span className="font-medium text-foreground/80">
                    {project.leader.full_name}
                  </span>
                  <span className="mx-1 text-muted-2">·</span>
                  <span>
                    {project.leader.branch}, Y{project.leader.year}
                  </span>
                </Link>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={onSave}
              aria-label={saved ? "Remove from saved projects" : "Save project"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-all duration-150 ease-out hover:bg-surface-2 hover:text-accent focus-ring"
              tabIndex={0}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-transform duration-150",
                  saved ? "fill-accent text-accent" : "",
                  "group-hover:scale-105"
                )}
                strokeWidth={saved ? 0 : 2}
              />
            </button>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="px-5 pt-3.5">
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/85">
          {project.short_description}
        </p>
      </div>

      {/* BADGES: Type + Status */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <TypeBadge type={project.type} size="sm" />
        <StatusBadge status={project.status} size="sm" />
      </div>

      {/* HACKATHON — when applicable */}
      {project.hackathon_name && (
        <div className="mx-5 mt-3.5 flex items-center gap-2 rounded-md bg-accent/[0.07] border border-accent/15 px-3 py-2 text-sm">
          <Trophy className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
          {project.hackathon_url ? (
            <a
              href={project.hackathon_url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-xs font-medium text-accent hover:underline decoration-dotted underline-offset-2"
            >
              {project.hackathon_name}
            </a>
          ) : (
            <span className="truncate text-xs font-medium text-accent/90">
              {project.hackathon_name}
            </span>
          )}
        </div>
      )}

      {/* TECH STACK — restrained chips */}
      <div className="flex flex-wrap gap-1.5 px-5 pt-4">
        {project.tech_stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-surface-2/70 px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-border"
          >
            {tech}
          </span>
        ))}
        {project.tech_stack.length > 4 && (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-2">
            +{project.tech_stack.length - 4}
          </span>
        )}
      </div>

      {/* FOOTER: Stats + CTA */}
      <div className="mt-5 border-t border-border/70">
        {/* Stats row */}
        <div className="flex items-center justify-between px-5 py-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <Users2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="font-medium tabular-nums text-foreground/70">
              {project.current_team_size}
              <span className="mx-0.5 text-muted-2">/</span>
              {project.max_team_size}
            </span>
            <span className="ml-1 text-muted-2">
              {project.current_team_size === 1 ? "member" : "members"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-2 tabular-nums" title={project.updated_at}>
              updated{" "}
              {formatDistanceToNow(new Date(project.updated_at), {
                addSuffix: true,
              })}
            </span>
            <button
              aria-label="Share project"
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <RequestButton projectId={project.id} status={project.status} relation={relation} />
        </div>
      </div>
    </article>
  );
}

// Local cn helper to avoid unused import warning if global cn is not re-imported above
import { cn } from "@/lib/utils";
