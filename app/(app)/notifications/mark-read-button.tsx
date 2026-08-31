"use client";

import { useTransition } from "react";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./actions";

export function MarkAsReadButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAsRead() {
    startTransition(async () => {
      try {
        await markNotificationAsRead(notificationId);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    });
  }

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isPending}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-all hover:bg-surface-2 hover:text-accent disabled:opacity-50"
      title="Mark as read"
      aria-label="Mark notification as read"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </button>
  );
}

export function MarkAllAsReadButton() {
  const [isPending, startTransition] = useTransition();

  function handleMarkAllAsRead() {
    startTransition(async () => {
      try {
        await markAllNotificationsAsRead();
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    });
  }

  return (
    <button
      onClick={handleMarkAllAsRead}
      disabled={isPending}
      className="btn-secondary inline-flex shrink-0 items-center gap-2 text-sm"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Marking...
        </>
      ) : (
        <>
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </>
      )}
    </button>
  );
}
