"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { joinRequestSchema, type JoinRequestInput } from "@/lib/validations/project";
import { submitJoinRequest } from "@/app/(app)/projects/actions";
import { cn } from "@/lib/utils";

export function JoinRequestDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinRequestInput>({ resolver: zodResolver(joinRequestSchema) });

  // Escape key and body scroll lock
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
    }
  }, [open, reset]);

  async function onSubmit(values: JoinRequestInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      await submitJoinRequest(projectId, values);
      router.refresh();
      onClose();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jr-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="rounded-2xl border border-border bg-surface shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              <h2
                id="jr-title"
                className="font-display text-xl font-semibold tracking-tight text-foreground"
              >
                Request to join
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                The project leader will review your profile alongside this message before deciding.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-ring"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 pt-5 space-y-4">
            <div>
              <label
                htmlFor="jr-why"
                className="field-label"
              >
                Why do you want to join?
              </label>
              <textarea
                id="jr-why"
                {...register("whyMessage")}
                className="input min-h-[96px] leading-relaxed"
                placeholder="What drew you to this project? What excites you about the idea?"
              />
              {errors.whyMessage && (
                <p className="field-error">{errors.whyMessage.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="jr-contrib"
                className="field-label"
              >
                What can you contribute?
              </label>
              <textarea
                id="jr-contrib"
                {...register("contributionMessage")}
                className="input min-h-[96px] leading-relaxed"
                placeholder="Relevant skills, past experience, or time you can commit"
              />
              {errors.contributionMessage && (
                <p className="field-error">{errors.contributionMessage.message}</p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-danger/25 bg-danger/8 px-3.5 py-2.5 text-sm text-danger"
              >
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className={cn(
                  "btn-secondary h-10 px-4 text-sm font-medium"
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary h-10 px-5 text-sm font-semibold sm:min-w-[140px]"
              >
                {submitting ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
