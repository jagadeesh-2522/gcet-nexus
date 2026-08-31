"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | "nodes"     // 0.0 – 0.4s  nodes fade in
  | "lines"     // 0.4 – 0.8s  lines draw
  | "converge"  // 0.8 – 1.1s  network converges inward
  | "logo"      // 1.1 – 1.8s  logo reveals + holds
  | "exit"      // 1.8 – 2.1s  overlay fades out
  | "done";     // overlay gone, children fully visible

// ─── Network layout ───────────────────────────────────────────────────────────
//
// ViewBox is 320×320. Logo sits in the centre ~100px radius.
// Nodes are scattered ~130–155px from centre, outside the logo zone.
// Lines connect the ring of nodes to each other (not into the centre),
// keeping the network visually behind/around the logo.

const CX = 160; // SVG centre x
const CY = 160; // SVG centre y

// 6 nodes evenly distributed on a ~148px radius ring, rotated 15° so no node
// sits exactly top/bottom which feels more organic.
const RING_R = 148;
const NODES = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6 + Math.PI / 12; // 30° steps, offset 15°
  return {
    id: i,
    x: CX + RING_R * Math.cos(angle),
    y: CY + RING_R * Math.sin(angle),
    // translate to converge toward centre (reduce radius to ~30px)
    tx: (CX - (CX + RING_R * Math.cos(angle))) * 0.82,
    ty: (CY - (CY + RING_R * Math.sin(angle))) * 0.82,
  };
});

// Connect adjacent pairs in the ring
const LINES = NODES.map((n, i) => {
  const next = NODES[(i + 1) % NODES.length];
  const dx = next.x - n.x;
  const dy = next.y - n.y;
  return { id: i, x1: n.x, y1: n.y, x2: next.x, y2: next.y, len: Math.hypot(dx, dy) };
});

// ─── Component ────────────────────────────────────────────────────────────────

export function IntroAnimation({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("nodes");
  // reducedMotion is null until we can read the media query client-side
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Read prefers-reduced-motion once mounted
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    if (mq.matches) {
      // Reduced-motion: skip straight to done after a brief pause
      schedule(() => setStage("done"), 400);
    } else {
      schedule(() => setStage("lines"),    400);
      schedule(() => setStage("converge"), 800);
      schedule(() => setStage("logo"),    1100);
      schedule(() => setStage("exit"),    1800);
      schedule(() => setStage("done"),    2150);
    }

    return () => timers.current.forEach(clearTimeout);
  }, []);

  // While we haven't determined reducedMotion yet, render the overlay (no flash)
  if (stage === "done") return <>{children}</>;

  const converging = stage === "converge" || stage === "logo" || stage === "exit";
  const showLogo   = stage === "logo" || stage === "exit";
  const exiting    = stage === "exit";

  return (
    <>
      {/*
        The overlay sits above everything (z-50). When stage === "exit" we
        apply the intro-exit animation. Once stage flips to "done" this whole
        subtree unmounts and children render alone.
      */}
      <div
        aria-hidden="true"
        style={
          exiting
            ? { animation: "intro-exit 0.35s ease-out forwards" }
            : undefined
        }
        className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(226_28%_7%)]"
      >
        {/* ── Network SVG ─────────────────────────────────────────── */}
        <svg
          viewBox="0 0 320 320"
          className="absolute inset-0 h-full w-full"
          style={{ maxWidth: "min(100vw, 100vh)" }}
          aria-hidden="true"
        >
          {/* Connecting lines — draw in during "lines" stage */}
          {LINES.map((l) => (
            <line
              key={l.id}
              x1={l.x1} y1={l.y1}
              x2={l.x2} y2={l.y2}
              stroke="hsl(231 76% 63% / 0.35)"
              strokeWidth="1"
              strokeDasharray={l.len}
              strokeDashoffset={l.len}
              style={
                stage !== "nodes"
                  ? {
                      animation: `intro-line-draw 0.35s ease-out ${l.id * 0.045}s forwards`,
                      // fade out when converging
                      opacity: converging ? 0 : 1,
                      transition: "opacity 0.4s ease-in",
                    }
                  : { opacity: 0 }
              }
            />
          ))}

          {/* Network nodes */}
          {NODES.map((n, i) => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={3.5}
              fill="hsl(231 76% 63%)"
              style={{
                // Appear: staggered fade+scale from their ring positions
                animation: `intro-node-in 0.25s ease-out ${i * 0.06}s both,
                             intro-node-pulse 2.4s ease-in-out ${i * 0.06 + 0.25}s infinite`,
                // Converge: CSS transform toward centre
                transform: converging
                  ? `translate(${n.tx}px, ${n.ty}px) scale(${showLogo ? 0 : 0.6})`
                  : "translate(0,0) scale(1)",
                transformOrigin: `${n.x}px ${n.y}px`,
                transformBox: "fill-box",
                transition: converging
                  ? `transform 0.35s ease-in ${i * 0.03}s, opacity 0.3s ease-in ${showLogo ? "0s" : "0.3s"}`
                  : undefined,
                opacity: showLogo ? 0 : 1,
              }}
            />
          ))}
        </svg>

        {/* ── Logo ───────────────────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center"
          style={
            showLogo
              ? { animation: "intro-logo-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards" }
              : { opacity: 0, transform: "scale(0.88)" }
          }
        >
          {/* Logo image — fixed 96px on mobile, 120px on desktop */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32">
            <Image
              src="/gcet-nexus-logo.png"
              alt="GCET Nexus"
              fill
              className="object-contain"
              priority
              draggable={false}
            />
          </div>

          {/* Wordmark */}
          <p
            className="mt-5 font-display text-xl font-semibold tracking-widest text-white sm:text-2xl"
            style={{ letterSpacing: "0.18em" }}
          >
            GCET NEXUS
          </p>
          <p
            className="mt-1 text-xs tracking-widest text-[hsl(231_76%_63%/0.8)] sm:text-sm"
            style={{ letterSpacing: "0.22em" }}
          >
            Connect · Collaborate · Build
          </p>
        </div>

        {/* Very subtle radial vignette so the edges feel deep */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, hsl(226 28% 4% / 0.7) 100%)",
          }}
        />
      </div>

      {/* Children mount immediately but are hidden behind the overlay */}
      {children}
    </>
  );
}
