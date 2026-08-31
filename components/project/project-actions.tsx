"use client";

import { useState, useEffect } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteProject } from "@/app/(app)/projects/actions";
import { cn } from "@/lib/utils";

export function ProjectActions({ projectId }: { projectId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await deleteProject(projectId);
    } catch (e) {
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
        setError(e.message);
        setDeleting(false);
      }
    }
  }

  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  return (
    <>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-danger/25 bg-danger/[0.07] px-3 py-2 text-[13px] font-medium text-danger",
            "transition-colors hover:bg-danger/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30",
          )}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      ) : (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-fade-in"
            onClick={() => !deleting && setShowConfirm(false)}
          />
          <div className="relative mx-4 w-full max-w-sm animate-slide-up rounded-2xl border border-border bg-background p-6 shadow-xl ring-1 ring-black/5">
            <button
              onClick={() => !deleting && setShowConfirm(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Close"
              disabled={deleting}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-danger/[0.1]">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>

            <h2
              id="del-title"
              className="font-display text-[18px] font-semibold leading-snug text-foreground"
            >
              Delete this project?
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              This cannot be undone. All project data, team members, and join requests will be
              permanently deleted.
            </p>

            {error && (
              <p className="mt-4 rounded-md border border-danger/20 bg-danger/[0.08] px-3 py-2 text-[12.5px] text-danger">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className={cn(
                  "flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-[13.5px] font-medium text-foreground",
                  "transition-colors hover:bg-surface-2 disabled:opacity-50",
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={cn(
                  "flex-1 rounded-md bg-danger px-3 py-2.5 text-[13.5px] font-medium text-white",
                  "transition-colors hover:bg-danger/92 disabled:opacity-50",
                )}
              >
                {deleting ? "Deleting…" : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
