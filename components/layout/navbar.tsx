"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, LayoutGrid, Plus, Sparkles } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/feed",        label: "Feed",     icon: LayoutGrid },
  { href: "/discover",    label: "Discover", icon: Compass    },
  { href: "/my-projects", label: "Projects", icon: Sparkles   },
];

export function Navbar({ unreadNotifications = 0, userId }: { unreadNotifications?: number; userId?: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop / tablet top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-sticky border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container-app flex h-14 items-center justify-between gap-4">

          {/* Brand */}
          <Link
            href="/feed"
            className="flex shrink-0 items-center gap-2.5 rounded-md outline-none
                       transition-opacity duration-150 ease-out hover:opacity-90
                       focus-visible:ring-[2px] focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-md p-1 -m-1"
          >
            <Logo className="h-6 w-6" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[0.9375rem] font-semibold tracking-tighter text-foreground">
                GCET
              </span>
              <span className="font-display text-[0.9375rem] font-medium tracking-tight text-muted">
                Nexus
              </span>
            </div>
          </Link>

          {/* Centre nav — hidden below md */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 rounded-md bg-surface-2 shadow-xs" />
                  )}
                  <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 2} />
                  <span className="tracking-snug">{label}</span>
                  {active && (
                    <span
                      className="absolute -bottom-px left-3 right-3 h-px bg-accent/60"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* New project CTA */}
            <Link
              href="/projects/new"
              className="btn-primary h-9 px-3 text-sm gap-1"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
              <span className="hidden sm:inline font-medium">New</span>
              <span className="hidden md:hidden sm:block font-medium">+</span>
            </Link>

            <div className="mx-1 h-6 w-px bg-border/70" aria-hidden="true" />

            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ""}`}
              className={cn(
                "btn-icon relative",
                unreadNotifications > 0 && "text-accent bg-accent/5 hover:bg-accent/10"
              )}
            >
              <Bell className="h-4 w-4" strokeWidth={unreadNotifications > 0 ? 2.25 : 2} />
              {unreadNotifications > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1
                             text-[10px] font-bold leading-none text-white shadow-xs"
                >
                  {unreadNotifications > 99 ? "99+" : unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {/* User Menu */}
            <UserMenu userId={userId} />
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-sticky md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="border-t border-border/70 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_24px_-8px_rgb(0_0_0_/_0.25)]">
          <div className="flex items-stretch justify-around px-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                    "transition-all duration-150 ease-out focus-visible:outline-none active:scale-[0.96]",
                    active ? "text-accent" : "text-muted active:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />
                  )}
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-all duration-150 ease-out",
                      active && "scale-[1.04]"
                    )}
                    strokeWidth={active ? 2.5 : 2.25}
                  />
                  <span className="tracking-wide">{label}</span>
                </Link>
              );
            })}

            {/* New project — accent tinted */}
            <Link
              href="/projects/new"
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                "text-accent transition-all duration-150 ease-out focus-visible:outline-none active:scale-[0.96]",
                pathname === "/projects/new" && "opacity-70"
              )}
            >
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-accent/12 ring-1 ring-accent/15">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="tracking-wide">New</span>
            </Link>
          </div>
        </div>
        {/* Home indicator spacing for iOS */}
        <div className="h-[env(safe-area-inset-bottom)] w-full bg-background/95" aria-hidden="true" />
      </nav>
    </>
  );
}
