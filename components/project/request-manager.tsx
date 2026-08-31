"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Github, Linkedin } from "lucide-react";
import type { JoinRequest } from "@/lib/types";
import { decideJoinRequest } from "@/app/(app)/projects/actions";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function RequestManager({
  projectId,
  requests,
}: {
  projectId: string;
  requests: JoinRequest[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center">
        <p className="text-[13px] text-muted">No pending requests right now.</p>
      </div>
    );
  }

  function decide(requestId: string, decision: "accepted" | "declined") {
    setError(null);
    startTransition(async () => {
      try {
        await decideJoinRequest(requestId, projectId, decision);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md border border-danger/20 bg-danger/[0.08] px-3 py-2 text-[13px] text-danger">
          {error}
        </p>
      )}
      {requests.map((req) => {
        const applicant = req.applicant;

        return (
          <div
            key={req.id}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
          >
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  src={applicant?.avatar_url}
                  alt={applicant?.full_name ?? "Unknown"}
                  fallback={applicant?.full_name ?? "?"}
                  size="md"
                />

                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${req.applicant_id}`}
                      className="text-[14px] font-semibold text-foreground transition-colors hover:text-accent"
                    >
                      {applicant?.full_name || "Unknown Student"}
                    </Link>
                    <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-[2px] text-[11px] font-medium text-muted">
                      Pending
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {applicant?.branch || "N/A"} · Year {applicant?.year || "?"}
                    {applicant?.section ? ` · Section ${applicant.section}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => decide(req.id, "accepted")}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md border border-success/25 bg-success/[0.09] px-3 text-[13px] font-medium text-success transition-colors",
                    "hover:bg-success/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/30 disabled:opacity-50",
                  )}
                  title="Accept request"
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Accept</span>
                </button>
                <button
                  onClick={() => decide(req.id, "declined")}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md border border-danger/25 bg-danger/[0.09] px-3 text-[13px] font-medium text-danger transition-colors",
                    "hover:bg-danger/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:opacity-50",
                  )}
                  title="Decline request"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Decline</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/70 bg-surface-2/40 p-4">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Why they want to join
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground/85">
                  {req.why_message}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                  What they can contribute
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground/85">
                  {req.contribution_message}
                </p>
              </div>
            </div>

            {(applicant?.github_url || applicant?.linkedin_url) && (
              <div className="flex gap-4 border-t border-border/70 px-4 py-3 text-[12px]">
                {applicant?.github_url && (
                  <a
                    href={applicant.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                )}
                {applicant?.linkedin_url && (
                  <a
                    href={applicant.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
