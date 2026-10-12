"use client";

import React from "react";
import { motion } from "framer-motion";
import { BackgroundLayerProps } from "./types";

export function HeroGradient({ isReducedMotion }: BackgroundLayerProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">

      {/* ── Layer 1: Left-to-Right Black Gradient (text readability) ────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, transparent 60%)",
        }}
      />

      {/* ── Layer 2: Burgundy Multiply Tone (~15% opacity) ───────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(111, 29, 44, 0.15)",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Layer 3: 5A — Animated warm golden radial light behind venue card ──
          8s duration — deliberately out of phase with card float (6s)
          so glow and card never perfectly align (organic feel)              */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: "-8%",
          top: "10%",
          width: "65vw",
          height: "80vh",
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(200, 161, 101, 0.20) 0%, rgba(200, 161, 101, 0.10) 35%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={isReducedMotion
          ? { opacity: 0.10 }
          : { opacity: [0.10, 0.18, 0.10], scale: [1, 1.06, 1] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Layer 4: Edge Vignette (never darkens center) ───────────────────── 
          5B: Mobile reduces outer opacity from 0.55 → 0.32 to avoid
          darkening text when layout collapses to single column           */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,5,8,0.55) 100%)",
        }}
      />
      {/* Mobile-specific vignette — softer edges */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(10,5,8,0.32) 100%)",
        }}
      />

      {/* ── Bottom fade into next section ──────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to top, #FDFBF7 0%, rgba(253,251,247,0.4) 40%, transparent 100%)",
        }}
      />

      {/* ── Top fade for Navbar contrast ───────────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-36 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
