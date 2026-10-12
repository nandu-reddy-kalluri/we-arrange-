"use client";

import React from "react";
import { motion } from "framer-motion";
import { LightingLayerProps } from "./types";

/**
 * HeroLighting
 *
 * All orbs are Framer Motion `motion.div` elements — no `dangerouslySetInnerHTML` CSS.
 * Each light source has a unique duration + delay so they breathe independently (1A, 1D).
 * blend mode: screen on all orbs for additive, realistic light stacking.
 */

interface LightOrb {
  /** Framer animate keyframes */
  opacity: number[];
  scale: number[];
  /** CSS position */
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width: string;
  height: string;
  background: string;
  blur: number;
  duration: number;
  delay: number;
  /** Optional: extra translateX keyframes for candle flutter */
  x?: string[];
}

const LIGHT_ORBS: LightOrb[] = [
  // 1A — Chandelier Bloom #1 (primary, top-right)
  {
    opacity: [0.18, 0.32, 0.18],
    scale:   [1, 1.06, 1],
    top: "-5%", right: "5%",
    width: "52vw", height: "55vw",
    background: "radial-gradient(ellipse at 50% 30%, rgba(255,220,130,0.55) 0%, rgba(200,161,101,0.30) 40%, transparent 70%)",
    blur: 80,
    duration: 10, delay: 0,
  },
  // 1A — Chandelier Bloom #2 (secondary, centre-top)
  {
    opacity: [0.15, 0.28, 0.15],
    scale:   [1, 1.07, 1],
    top: "0%", right: "28%",
    width: "30vw", height: "40vw",
    background: "radial-gradient(ellipse at 50% 20%, rgba(255,200,100,0.45) 0%, rgba(212,175,55,0.20) 45%, transparent 70%)",
    blur: 70,
    duration: 13, delay: 4.5,
  },
  // 1A — Candle Cluster Warmth (bottom-centre aisle)
  {
    opacity: [0.12, 0.22, 0.16, 0.12],
    scale:   [1, 1.04, 0.97, 1],
    bottom: "10%", left: "30%",
    width: "40vw", height: "30vw",
    background: "radial-gradient(ellipse at 50% 80%, rgba(255,180,80,0.30) 0%, rgba(200,140,60,0.15) 50%, transparent 75%)",
    blur: 100,
    duration: 6.5, delay: 1.2,
  },
  // 1A — Warm Diagonal Ray
  {
    opacity: [0.06, 0.14, 0.06],
    scale:   [1, 1.01, 1],
    top: "-15%", right: "8%",
    width: "55vw", height: "130%",
    background: "linear-gradient(170deg, rgba(255,210,120,0.22) 0%, rgba(200,161,101,0.10) 40%, transparent 75%)",
    blur: 50,
    duration: 18, delay: 2,
  },
  // 1A — Ambient Floor Reflection
  {
    opacity: [0.10, 0.20, 0.10],
    scale:   [1, 1.03, 1],
    bottom: "5%", left: "20%",
    width: "60%", height: "30vh",
    background: "radial-gradient(ellipse at 50% 100%, rgba(255,160,60,0.20) 0%, transparent 65%)",
    blur: 60,
    duration: 22, delay: 7,
  },
];

// 1B — Second candle orb with micro-flutter (translateX stutter)
const CANDLE_FLUTTER_ORB: LightOrb = {
  opacity: [0.10, 0.18, 0.14, 0.20, 0.13, 0.10],
  scale:   [1, 1.02, 0.98, 1.03, 0.99, 1],
  x:       ["0%", "0.5%", "-0.3%", "0.2%", "-0.4%", "0%"],
  bottom: "18%", right: "22%",
  width: "18vw", height: "14vw",
  background: "radial-gradient(ellipse at 50% 80%, rgba(255,160,60,0.25) 0%, transparent 70%)",
  blur: 50,
  duration: 3.8, delay: 0.6,
};

export function HeroLighting({ isReducedMotion }: LightingLayerProps) {
  return (
    <div className="absolute inset-0 z-25 pointer-events-none overflow-hidden">

      {/* ── 1C: Crystal Sparkle — hot-spot glint of chandeliers ──────────────
          Small, sharp, bright white — creates the real photography highlight  */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "2%", right: "12%",
          width: "4vw", height: "4vw",
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,248,220,0.90) 0%, rgba(255,230,160,0.50) 40%, transparent 70%)",
          filter: "blur(16px)",
        }}
        animate={isReducedMotion
          ? { opacity: 0.60 }
          : { opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── 1D: Main light orbs — all Framer Motion, desynced (1A) ─────────── */}
      {LIGHT_ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            top:    orb.top,
            right:  orb.right,
            bottom: orb.bottom,
            left:   orb.left,
            width:  orb.width,
            height: orb.height,
            background: orb.background,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={isReducedMotion
            ? { opacity: orb.opacity[0] }
            : { opacity: orb.opacity, scale: orb.scale }
          }
          transition={{
            duration: orb.duration,
            delay:    orb.delay,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        />
      ))}

      {/* ── 1B: Candle Flutter orb — micro-stutter translateX ─────────────── */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          bottom: CANDLE_FLUTTER_ORB.bottom,
          right:  CANDLE_FLUTTER_ORB.right,
          width:  CANDLE_FLUTTER_ORB.width,
          height: CANDLE_FLUTTER_ORB.height,
          background: CANDLE_FLUTTER_ORB.background,
          filter: `blur(${CANDLE_FLUTTER_ORB.blur}px)`,
        }}
        animate={isReducedMotion
          ? { opacity: 0.10 }
          : {
              opacity: CANDLE_FLUTTER_ORB.opacity,
              scale:   CANDLE_FLUTTER_ORB.scale,
              x:       CANDLE_FLUTTER_ORB.x,
            }
        }
        transition={{
          duration: CANDLE_FLUTTER_ORB.duration,
          delay:    CANDLE_FLUTTER_ORB.delay,
          repeat:   Infinity,
          ease:     "easeInOut",
        }}
      />
    </div>
  );
}
