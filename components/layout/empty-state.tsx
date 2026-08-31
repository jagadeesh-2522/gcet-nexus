import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}) {
  const ActionButton = () => {
    if (!actionLabel) return null;
    if (actionOnClick) {
      return (
        <button
          type="button"
          onClick={actionOnClick}
          className="btn-secondary h-10 px-5 text-sm font-medium"
        >
          {actionLabel}
        </button>
      );
    }
    if (actionHref) {
      return (
        <Link href={actionHref} className="btn-primary h-10 px-5 text-sm font-medium">
          {actionLabel}
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center overflow-hidden animate-fade-in">
      {/* Subtle decorative backdrop */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, hsl(var(--accent)) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Icon container */}
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/10 to-transparent" aria-hidden="true" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2 ring-1 ring-border shadow-xs">
          <Icon className="h-6 w-6 text-muted" strokeWidth={1.75} />
        </div>
      </div>

      <h3 className="relative font-display text-lg font-semibold tracking-tight text-foreground text-balance">
        {title}
      </h3>
      <p className="relative mt-2 max-w-md text-sm leading-relaxed text-muted text-pretty">
        {description}
      </p>

      {actionLabel && (
        <div className="relative mt-8">
          <ActionButton />
        </div>
      )}
    </div>
  );
}
