"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHeroMotion } from "./hooks/useHeroMotion";
import { HeroVideo } from "./HeroVideo";
import { HeroOverlay } from "./HeroOverlay";

export function HeroBackdrop() {
  const { mounted, isReducedMotion, imageX, imageY, lightX, lightY } = useHeroMotion();

  if (!mounted) {
    return <div className="absolute inset-0 z-0 overflow-hidden bg-[#1A0810]" />;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#1A0810]">
      {/* Image layer — moves fastest (±8px), feels closest to the viewer */}
      <motion.div
        style={!isReducedMotion ? { x: imageX, y: imageY } : {}}
        className="absolute inset-[-2%] w-[104%] h-[104%]"
      >
        <HeroVideo isReducedMotion={isReducedMotion} />
      </motion.div>

      {/* Overlay layer — gradient + lighting move at separate speeds */}
      <HeroOverlay
        isReducedMotion={isReducedMotion}
        lightX={!isReducedMotion ? lightX : undefined}
        lightY={!isReducedMotion ? lightY : undefined}
      />
    </div>
  );
}
