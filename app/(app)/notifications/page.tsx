import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  UserPlus,
  UserMinus,
  FileText,
  Inbox,
  CheckCircle,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { MarkAsReadButton, MarkAllAsReadButton } from "./mark-read-button";
import type { Notification, Profile, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EnrichedNotification = Notification & {
  actor?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  project?: Pick<Project, "id" | "name"> | null;
};

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

const typeIconMap = {
  join_request_received: UserPlus,
  join_request_accepted: CheckCircle,
  join_request_declined: XCircle,
  added_to_project: UserPlus,
  removed_from_project: UserMinus,
  project_update: FileText,
} as const;

const typeActionMap: Partial<Record<string, string>> = {
  join_request_received: "Review request",
  join_request_accepted: "View project",
  join_request_declined: "View project",
  added_to_project: "View project",
  project_update: "View update",
};

export default async function NotificationsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/notifications");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Notification[]>();

  const enrichedNotifications: EnrichedNotification[] = [];

  if (notifications && notifications.length > 0) {
    for (const notification of notifications) {
      const payload = notification.payload as Record<string, string>;
      let actor = null;
      let project = null;

      if (payload.actor_id) {
        const { data: actorData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", payload.actor_id)
          .single();
        actor = actorData;
      }

      if (payload.project_id) {
        const { data: projectData } = await supabase
          .from("projects")
          .select("id, name")
          .eq("id", payload.project_id)
          .single();
        project = projectData;
      }

      enrichedNotifications.push({
        ...notification,
        actor,
        project,
      });
    }
  }

  const unreadCount = enrichedNotifications.filter((n) => !n.is_read).length;

  const today: EnrichedNotification[] = [];
  const yesterday: EnrichedNotification[] = [];
  const earlier: EnrichedNotification[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  enrichedNotifications.forEach((notification) => {
    const notificationDate = new Date(notification.created_at);
    if (notificationDate >= todayStart) {
      today.push(notification);
    } else if (notificationDate >= yesterdayStart) {
      yesterday.push(notification);
    } else {
      earlier.push(notification);
    }
  });

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/[0.10] ring-1 ring-accent/20">
                <Bell className="h-5 w-5 text-accent" strokeWidth={2} />
              </div>
              <h1 className="font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                Notifications
              </h1>
            </div>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
              Stay up to date with what's happening around your projects
            </p>
          </div>

          {unreadCount > 0 && <MarkAllAsReadButton />}
        </div>

        {unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-md border border-accent/20 bg-accent/[0.07] px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-[12.5px] font-semibold text-accent">
              {unreadCount} unread
            </span>
          </div>
        )}
      </header>

      {enrichedNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-surface/40 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 shadow-xs">
            <Inbox className="h-6 w-6 text-muted" strokeWidth={1.75} />
          </div>
          <h2 className="mt-5 font-display text-[17px] font-semibold text-foreground">
            You're all caught up
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
            New project activity and join request updates will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {today.length > 0 && (
            <Section title="Today" items={today} />
          )}
          {yesterday.length > 0 && (
            <Section title="Yesterday" items={yesterday} />
          )}
          {earlier.length > 0 && (
            <Section title="Earlier" items={earlier} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: EnrichedNotification[] }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
        <span className="h-px flex-1 bg-border" />
      </h2>
      <div className="space-y-2">
        {items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </section>
  );
}

function NotificationItem({ notification }: { notification: EnrichedNotification }) {
  const Icon = typeIconMap[notification.type as keyof typeof typeIconMap] || Bell;
  const formattedDate = formatRelativeTime(notification.created_at);
  const payload = notification.payload as Record<string, string>;
  const action = typeActionMap[notification.type];

  const renderMessage = () => {
    const actor = notification.actor;
    const project = notification.project;

    switch (notification.type) {
      case "join_request_received":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            {actor ? (
              <Link
                href={`/profile/${actor.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {actor.full_name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">Someone</span>
            )}{" "}
            <span className="text-muted">requested to join</span>{" "}
            {project ? (
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {project.name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">your project</span>
            )}
          </p>
        );

      case "join_request_accepted":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            <span className="text-muted">Your join request for</span>{" "}
            {project ? (
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {project.name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">a project</span>
            )}{" "}
            <span className="text-muted">was</span>{" "}
            <span className="font-semibold text-success">accepted</span>
          </p>
        );

      case "join_request_declined":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            <span className="text-muted">Your join request for</span>{" "}
            {project ? (
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {project.name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">a project</span>
            )}{" "}
            <span className="text-muted">was declined</span>
          </p>
        );

      case "added_to_project":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            <span className="text-muted">You were added to</span>{" "}
            {project ? (
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {project.name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">a project</span>
            )}
          </p>
        );

      case "removed_from_project":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            <span className="text-muted">You were removed from</span>{" "}
            {project ? (
              <span className="font-semibold text-foreground">{project.name}</span>
            ) : (
              <span className="font-semibold text-foreground">a project</span>
            )}
          </p>
        );

      case "project_update":
        return (
          <p className="text-[14px] leading-[1.55] text-foreground/90">
            <span className="text-muted">New update in</span>{" "}
            {project ? (
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground transition-colors hover:text-accent"
              >
                {project.name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">your project</span>
            )}
          </p>
        );

      default:
        return (
          <p className="text-[14px] text-foreground/90">You have a new notification</p>
        );
    }
  };

  const link = payload.project_id ? `/projects/${payload.project_id}` : undefined;
  const isUnread = !notification.is_read;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-150",
        isUnread
          ? "border-accent/15 bg-accent/[0.03] hover:border-accent/25 hover:bg-accent/[0.05] shadow-xs"
          : "border-border bg-surface hover:bg-surface-2/70",
      )}
    >
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/70" />
      )}

      <div className="flex items-start gap-4 p-4 pl-4">
        {notification.actor ? (
          <Link href={`/profile/${notification.actor.id}`} className="shrink-0 pt-0.5">
            <Avatar
              src={notification.actor.avatar_url}
              alt={notification.actor.full_name}
              fallback={notification.actor.full_name}
              size="sm"
            />
          </Link>
        ) : (
          <div
            className={cn(
              "flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full",
              isUnread ? "bg-accent/[0.12] text-accent" : "bg-surface-2 text-muted",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </div>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          {renderMessage()}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <time className="text-[11.5px] text-muted tabular-nums">{formattedDate}</time>
            {action && link && (
              <>
                <span className="text-border-strong">·</span>
                <Link
                  href={link}
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  {action}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          {!isUnread && (
            <CheckCheck className="h-3.5 w-3.5 text-muted/40" strokeWidth={2.5} />
          )}
          {isUnread && (
            <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <MarkAsReadButton notificationId={notification.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
