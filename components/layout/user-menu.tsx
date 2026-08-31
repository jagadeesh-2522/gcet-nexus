"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, User as UserIcon, Eye, ChevronRight } from "lucide-react";
import { logout } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

export function UserMenu({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "btn-icon border border-border/70 bg-surface transition-all duration-150 ease-out",
          open && "bg-surface-2 ring-[2px] ring-accent/25 border-accent/30"
        )}
      >
        <UserIcon className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 origin-top-right animate-scale-in z-50">
          <div className="overflow-hidden rounded-xl border border-border bg-surface-2 shadow-lg ring-1 ring-black/5">
            <div className="p-1">
              {userId && (
                <>
                  <MenuItem
                    href={`/profile/${userId}`}
                    onClick={() => setOpen(false)}
                    icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
                    label="View Profile"
                  />

                  <MenuItem
                    href="/settings"
                    onClick={() => setOpen(false)}
                    icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
                    label="Settings"
                  />

                  <div className="my-1 mx-2 h-px bg-border/70" role="separator" />
                </>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group w-full flex items-center gap-3 px-3 py-2 text-sm text-danger transition-colors
                           rounded-md hover:bg-danger/8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                <span className="font-medium">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  icon,
  label,
}: {
  href: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 px-3 py-2 text-sm text-foreground
                 rounded-md transition-colors hover:bg-surface-3"
    >
      <span className="text-muted group-hover:text-foreground transition-colors">{icon}</span>
      <span className="font-medium">{label}</span>
      <ChevronRight
        className="ml-auto h-3.5 w-3.5 text-muted-2 opacity-0 -translate-x-1 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-x-0"
        strokeWidth={2}
      />
    </Link>
  );
}