import { cn } from "@/lib/utils";
import type { ProjectStatus, ProjectType } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  recruiting: "Recruiting",
  in_progress: "In Progress",
  closed: "Recruitment Closed",
  completed: "Completed",
  paused: "Paused",
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  recruiting: "bg-live/10 text-live border-live/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  closed: "bg-surface-2 text-muted border-border",
  completed: "bg-surface-2 text-muted border-border",
  paused: "bg-warning/10 text-warning border-warning/20",
};

export function StatusBadge({ status, size = "md" }: { status: ProjectStatus; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-medium",
        size === "sm" ? "text-[10px]" : "text-[11px]",
        STATUS_STYLE[status]
      )}
    >
      {status === "recruiting" && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-40 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live" />
        </span>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

const TYPE_LABEL: Record<ProjectType, string> = {
  hackathon: "Hackathon",
  personal: "Personal",
  academic: "Academic",
  open_source: "Open Source",
  startup: "Startup",
};

export function TypeBadge({ type, size = "md" }: { type: ProjectType; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface-2/50 text-muted font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      )}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}
