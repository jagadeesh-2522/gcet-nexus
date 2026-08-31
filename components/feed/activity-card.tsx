import Link from "next/link";
import { Rocket, Users, FileText, ArrowUpRight } from "lucide-react";
import type { ActivityFeedItem } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const activityStyles = {
  project_created: {
    accent: "bg-accent",
    iconBg: "bg-accent/[0.08]",
    iconColor: "text-accent",
    icon: Rocket,
    label: "Project",
  },
  member_joined: {
    accent: "bg-success",
    iconBg: "bg-success/[0.08]",
    iconColor: "text-success",
    icon: Users,
    label: "Team",
  },
  update_posted: {
    accent: "bg-warning",
    iconBg: "bg-warning/[0.08]",
    iconColor: "text-warning",
    icon: FileText,
    label: "Update",
  },
} as const;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getActionText(activity: ActivityFeedItem): string {
  switch (activity.type) {
    case "project_created":
      return "created a new project";
    case "member_joined":
      return activity.context?.memberRole
        ? `joined as ${activity.context.memberRole}`
        : "joined the team";
    case "update_posted":
      return "posted an update";
    default:
      return "shared activity";
  }
}

export function ActivityCard({ activity }: { activity: ActivityFeedItem }) {
  const style = activityStyles[activity.type as keyof typeof activityStyles] || activityStyles.project_created;
  const Icon = style.icon;
  const actionText = getActionText(activity);
  const formattedDate = formatRelativeTime(activity.timestamp);

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-border bg-surface shadow-xs",
        "transition-all duration-200 ease-out hover:border-border-strong hover:shadow-sm",
      )}
    >
      <div className="absolute left-0 top-5 bottom-5 w-[2px] rounded-r-full opacity-80" style={{ backgroundColor: style.iconColor.includes('accent') ? 'hsl(248 84% 66%)' : style.iconColor.includes('success') ? 'hsl(148 60% 48%)' : 'hsl(42 90% 55%)' }} />

      <div className="flex gap-4 p-5 pl-5">
        <div className="flex shrink-0 flex-col items-center gap-2 pl-1">
          <Avatar
            src={activity.actor.avatar_url}
            alt={activity.actor.full_name}
            fallback={activity.actor.full_name}
            size="sm"
          />
          <div
            className={cn(
              "flex h-[22px] w-[22px] items-center justify-center rounded-md ring-1 ring-inset",
              style.iconBg,
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", style.iconColor)} strokeWidth={2.25} />
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href={`/profile/${activity.actor.id}`}
              className="text-[14px] font-semibold leading-snug text-foreground transition-colors hover:text-accent"
            >
              {activity.actor.full_name}
            </Link>
            <span className="text-[13.5px] leading-snug text-muted">{actionText}</span>
            <Link
              href={`/projects/${activity.project.id}`}
              className="text-[14px] font-medium leading-snug text-foreground transition-colors hover:text-accent"
            >
              {activity.project.name}
            </Link>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted">
            <span className="tabular-nums">{formattedDate}</span>
            <span className="text-border-strong">·</span>
            <span>{activity.actor.branch}</span>
            <span className="text-border-strong">·</span>
            <span>Year {activity.actor.year}</span>
          </div>

          {activity.context?.updateBody && (
            <div className="mt-3.5 rounded-md border border-border bg-surface-2/60 px-3.5 py-3">
              <p className="line-clamp-3 text-[13.5px] leading-relaxed text-foreground/85">
                "{activity.context.updateBody}"
              </p>
            </div>
          )}

          {activity.project.tech_stack.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {activity.project.tech_stack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-[3px] text-[11.5px] font-medium text-muted"
                >
                  {tech}
                </span>
              ))}
              {activity.project.tech_stack.length > 4 && (
                <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-[3px] text-[11.5px] font-medium text-muted">
                  +{activity.project.tech_stack.length - 4}
                </span>
              )}
            </div>
          )}

          <Link
            href={`/projects/${activity.project.id}`}
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
          >
            View project
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
