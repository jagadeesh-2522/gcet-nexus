import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Crown, Users2, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { StatusBadge, TypeBadge } from "../project/badges";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function PortfolioProjectCard({
  project,
  role,
}: {
  project: Project;
  role: "lead" | "member";
}) {
  const memberRole = role === "lead" ? "Project Lead" : "Member";
  const RoleIcon = role === "lead" ? Crown : Users2;
  const roleTone = role === "lead" ? "text-warning" : "text-success";
  const roleBg = role === "lead" ? "bg-warning/[0.08]" : "bg-success/[0.08]";

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-surface shadow-xs",
        "transition-all duration-200 ease-out hover:border-border-strong hover:shadow-sm",
      )}
    >
      <div className="relative h-[3px] w-full bg-transparent transition-colors duration-200 group-hover:bg-accent/60" />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[15.5px] font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
              {project.name}
            </h3>
            <div className="mt-1.5 inline-flex items-center gap-1.5">
              <div className={cn("flex h-5 w-5 items-center justify-center rounded-[5px]", roleBg)}>
                <RoleIcon className={cn("h-3 w-3", roleTone)} strokeWidth={2.25} />
              </div>
              <span className={cn("text-[11.5px] font-medium", roleTone)}>{memberRole}</span>
            </div>
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted/50 transition-all duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px] group-hover:text-accent" />
        </div>

        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-foreground/80">
          {project.short_description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={project.type} size="sm" />
          <StatusBadge status={project.status} size="sm" />
        </div>

        {project.hackathon_name && (
          <div className="flex items-center gap-2 rounded-md border border-accent/15 bg-accent/[0.06] px-2.5 py-1.5">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-accent" />
            {project.hackathon_url ? (
              <a
                href={project.hackathon_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[12px] font-medium text-accent hover:underline"
              >
                {project.hackathon_name}
              </a>
            ) : (
              <span className="text-[12px] font-medium text-accent">{project.hackathon_name}</span>
            )}
          </div>
        )}

        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-[3px] text-[11.5px] font-medium text-muted"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-[3px] text-[11.5px] font-medium text-muted">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/70 pt-3.5 text-[11.5px] text-muted">
          <div className="flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5" />
            <span className="tabular-nums">
              {project.current_team_size}/{project.max_team_size}
            </span>
          </div>
          <span className="tabular-nums">
            {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
