"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "btn-icon relative overflow-hidden border border-border/60 bg-surface/80 transition-all duration-200",
        "hover:border-border-strong hover:bg-surface-2",
        "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center transition-transform duration-300 ease-out",
          isDark ? "-translate-y-0 rotate-0 opacity-100" : "translate-y-5 rotate-90 opacity-0",
        )}
        style={{ position: isDark ? "relative" : "absolute" }}
      >
        <Sun className="h-4 w-4" />
      </div>
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center transition-transform duration-300 ease-out",
          !isDark ? "-translate-y-0 rotate-0 opacity-100" : "-translate-y-5 -rotate-90 opacity-0",
        )}
        style={{ position: !isDark ? "relative" : "absolute" }}
      >
        <Moon className="h-4 w-4" />
      </div>
    </button>
  );
}
