"use client";

import React from "react";
import { motion } from "framer-motion";
import { LightingLayerProps } from "./types";
import { HeroGradient } from "./HeroGradient";
import { HeroLighting } from "./HeroLighting";
import { HeroTexture } from "./HeroTexture";

export function HeroOverlay({ isReducedMotion, lightX, lightY }: LightingLayerProps) {
  return (
    <>
      {/* Gradient is static — furthest layer, acts as the sky */}
      <HeroGradient isReducedMotion={isReducedMotion} />

      {/* Lighting moves at the slow parallax plane — feels behind the image */}
      <motion.div
        className="absolute inset-0"
        style={lightX && lightY ? { x: lightX, y: lightY } : {}}
      >
        <HeroLighting isReducedMotion={isReducedMotion} />
      </motion.div>

      <HeroTexture />
    </>
  );
}
