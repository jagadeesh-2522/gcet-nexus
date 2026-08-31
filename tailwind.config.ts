import type { Config } from "tailwindcss";

// ─────────────────────────────────────────────────────────────────────────────
// GCET NEXUS — Tailwind design token map v2.0
//
// Premium, restrained, architectural.
// All color tokens are backed by CSS custom properties (HSL values without
// the hsl() wrapper) so they compose with Tailwind's opacity modifier syntax:
//   text-accent/60  →  color: hsl(var(--accent) / 0.6)
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────────────────
      colors: {
        background:    "hsl(var(--background))",
        surface:       "hsl(var(--surface))",
        "surface-2":   "hsl(var(--surface-2))",
        "surface-3":   "hsl(var(--surface-3))",
        "surface-4":   "hsl(var(--surface-4))",
        border:        "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        foreground:    "hsl(var(--foreground))",
        muted:         "hsl(var(--muted))",
        "muted-2":     "hsl(var(--muted-2))",
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          hover:      "hsl(var(--accent-hover))",
          active:     "hsl(var(--accent-active))",
          foreground: "hsl(var(--accent-foreground))",
          subtle:     "hsl(var(--accent-subtle))",
          weak:       "hsl(var(--accent-weak))",
        },
        live:     "hsl(var(--live))",
        success:  "hsl(var(--success))",
        warning:  "hsl(var(--warning))",
        danger:   "hsl(var(--danger))",
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ["var(--font-body)",    "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",    "ui-monospace",  "monospace"],
      },
      fontSize: {
        // Deliberately tight, professional scale
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],        // 11px — micro labels, badges
        xs:    ["0.75rem",   { lineHeight: "1.125rem" }],    // 12px — helper text
        sm:    ["0.875rem",  { lineHeight: "1.5rem" }],      // 14px — body default
        base:  ["1rem",      { lineHeight: "1.625rem" }],    // 16px — reading body
        lg:    ["1.0625rem", { lineHeight: "1.75rem" }],     // 17px — emphasis body
        xl:    ["1.1875rem", { lineHeight: "1.75rem" }],     // 19px — section lead
        "2xl": ["1.375rem",  { lineHeight: "1.35" }],        // 22px — section title
        "3xl": ["1.75rem",   { lineHeight: "1.2" }],         // 28px — page subtitle
        "4xl": ["2.25rem",   { lineHeight: "1.1" }],         // 36px — page title
        "5xl": ["3rem",      { lineHeight: "1.05" }],        // 48px — hero / showcase
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter:  "-0.025em",
        tight:    "-0.015em",
        snug:     "-0.005em",
        normal:   "0em",
        wide:     "0.02em",
        wider:    "0.05em",
        widest:   "0.1em",
      },
      fontWeight: {
        "450": "450",
        "550": "550",
        "650": "650",
      },

      // ── Spacing — musical rhythm ────────────────────────────────────────
      spacing: {
        // Semantic page padding
        "page-x":  "1.25rem",
        "page-xl": "2rem",

        // Section gaps
        "section": "3rem",
        "section-sm": "2rem",
        "section-lg": "4rem",

        // Additional tight spacing for micro-layouts
        "0.5": "0.125rem",
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem",
        "4.5": "1.125rem",
      },

      // ── Shadows — restrained architectural depth ────────────────────────
      boxShadow: {
        xs:     "var(--shadow-xs)",
        sm:     "var(--shadow-sm)",
        md:     "var(--shadow-md)",
        lg:     "var(--shadow-lg)",
        xl:     "var(--shadow-xl)",
        accent: "var(--shadow-accent)",
        "inset-border": "inset 0 0 0 1px hsl(var(--border))",
        "inset-border-strong": "inset 0 0 0 1px hsl(var(--border-strong))",
      },

      // ── Border radius — minimal not marshmallow ─────────────────────────
      borderRadius: {
        sm:   "0.25rem",    // 4px  — badges, micro chips
        md:   "0.375rem",   // 6px  — inputs, small buttons
        lg:   "0.5rem",     // 8px  — buttons, standard cards
        xl:   "0.75rem",    // 12px — primary cards
        "2xl":"1rem",       // 16px — modals, showcase panels
        full: "9999px",
      },

      // ── Transitions — natural, not showy ────────────────────────────────
      transitionDuration: {
        "0":   "0ms",
        fast:  "100ms",
        "150": "150ms",
        base:  "180ms",
        "200": "200ms",
        slow:  "300ms",
        "400": "400ms",
      },
      transitionTimingFunction: {
        "spring":       "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "standard":     "cubic-bezier(0.2, 0, 0, 1)",
        "emphasized":   "cubic-bezier(0.2, 0, 0, 1)",
      },

      // ── Keyframes ───────────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "node-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%":       { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in":    "fade-in 0.18s ease-out both",
        "scale-in":   "scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up":   "slide-up 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 0.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        "node-pulse": "node-pulse 2.2s ease-in-out infinite",
        "shimmer":    "shimmer 1.8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },

      // ── Max widths ───────────────────────────────────────────────────────
      maxWidth: {
        content: "42rem",
        reading: "38rem",
        app:     "72rem",
        "app-wide": "84rem",
      },

      // ── Z-index scale ───────────────────────────────────────────────────
      zIndex: {
        "hide":  "-1",
        "base":  "0",
        "docked": "10",
        "sticky": "20",
        "banner": "30",
        "overlay": "40",
        "modal": "50",
        "popout": "60",
        "toast": "70",
      },
    },
  },
  plugins: [],
};

export default config;
