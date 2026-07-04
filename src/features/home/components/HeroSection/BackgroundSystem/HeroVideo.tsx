"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundLayerProps } from "./types";
import { VIDEO_CONFIG } from "./utils/constants";
import Image from "next/image";

export function HeroVideo({ isReducedMotion }: BackgroundLayerProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <div className="absolute inset-0 z-0 bg-[#1A0810] overflow-hidden">
      {/* Crisp Hero Image — no blur, no brightness kill, object-center */}
      <div className="absolute inset-0 z-0">
        <Image
          src={VIDEO_CONFIG.poster}
          alt="Luxury Wedding Venue — Chandeliers and Candle Lit Aisle"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={95}
        />
      </div>

      {/* Video Player — rendered on top when ready, also crisp */}
      {!isReducedMotion && (
        <AnimatePresence>
          <motion.video
            initial={{ opacity: 0 }}
            animate={{ opacity: isVideoReady ? 1 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center z-10"
            src={VIDEO_CONFIG.src}
            poster={VIDEO_CONFIG.poster}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
            onCanPlay={() => setIsVideoReady(true)}
          />
        </AnimatePresence>
      )}
    </div>
  );
}
