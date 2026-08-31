import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ring?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-[13px]",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-base",
  "2xl": "h-20 w-20 text-lg",
};

// Deterministic color hash for avatar fallback backgrounds
// Gives each unique name a consistent, pleasant hue
function hashColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Cycle through curated hue palette: indigo-violet, teal, emerald, amber, rose, sky
  const palette = [
    { bg: "bg-[hsl(248_84%_66%_/_0.14)]", text: "text-[hsl(248_84%_72%)]" },
    { bg: "bg-[hsl(174_70%_45%_/_0.14)]", text: "text-[hsl(174_70%_52%)]" },
    { bg: "bg-[hsl(152_70%_48%_/_0.14)]", text: "text-[hsl(152_70%_54%)]" },
    { bg: "bg-[hsl(36_92%_52%_/_0.14)]", text: "text-[hsl(36_92%_56%)]" },
    { bg: "bg-[hsl(340_82%_62%_/_0.14)]", text: "text-[hsl(340_82%_68%)]" },
    { bg: "bg-[hsl(200_88%_58%_/_0.14)]", text: "text-[hsl(200_88%_64%)]" },
  ];
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  ring = true,
}: AvatarProps) {
  const initials = fallback
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = hashColor(fallback);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "rounded-full object-cover",
          ring && "ring-1 ring-border-strong",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold select-none",
        ring && "ring-1 ring-border",
        colors.bg,
        colors.text,
        sizeClasses[size],
        className
      )}
      aria-label={alt}
      role="img"
    >
      {initials || "?"}
    </div>
  );
}
