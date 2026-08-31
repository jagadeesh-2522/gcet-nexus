import Link from "next/link";
import type { ProjectMember } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function TeamList({ members }: { members: ProjectMember[] }) {
  if (members.length === 0) return null;

  return (
    <div className="space-y-1">
      {members.map((m) => (
        <Link
          key={m.profile_id}
          href={`/profile/${m.profile_id}`}
          className={cn(
            "group flex items-center gap-3 rounded-md p-2 transition-all duration-150",
            "hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
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
            <p className="truncate text-[12px] text-muted">
              {m.role ?? "Member"} · {m.profile?.branch}, Yr {m.profile?.year}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
