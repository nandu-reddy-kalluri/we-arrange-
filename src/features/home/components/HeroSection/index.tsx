"use client";

import React, { Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroBackdrop } from "./BackgroundSystem";
import { HeroForm } from "./HeroForm";
import { HeroFloatingCard } from "./HeroFloatingCard";

import { layout, spacing, typography, motionTokens, icons, zIndex } from "@/styles";

export default function HeroSection() {
  const { scrollY } = useScroll();
  // Scroll cue fades out as user scrolls down
  const scrollCueOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  return (
    <section className={`relative min-h-[60vh] md:min-h-screen flex items-center justify-center text-white overflow-hidden pt-16 md:pt-28 pb-6 md:pb-16`}>
      <HeroBackdrop />

      <div className={`${layout.maxWidth} ${spacing.container} ${layout.fullWidth} ${zIndex.content} flex flex-col lg:flex-row items-center justify-between ${spacing.gapHero} relative`}>

        {/* ── Left Column: Typography + Search Panel ── */}
        <div className="w-full lg:w-[52%] xl:w-[55%] text-left flex flex-col items-start gap-7 relative z-20">
          {/* Subtle dark backdrop protection gradient for hero text */}
          <div className="absolute -inset-6 bg-gradient-to-r from-black/60 via-black/35 to-transparent rounded-3xl blur-xl pointer-events-none -z-10" />

          {/* ── Eyebrow label: line expands → text slides in ── */}
          <div className="flex items-center gap-3 overflow-hidden">
            {/* 3B: Animated divider line (scaleX 0 → 1) */}
            <motion.span
              className="block h-px bg-gradient-to-r from-[#C8A165] to-transparent origin-left"
              style={{ width: 32 }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
            />
            {/* Eyebrow text slides in from left */}
            <motion.span
              className="font-sans text-[10px] sm:text-[11px] font-black uppercase text-[#C8A165] tracking-[0.25em]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            >
              DREAM • Hyderabad&apos;s Elite Wedding Concierge
            </motion.span>
          </div>

          {/* ── 3A: Headline — two lines staggered wipe-up reveal ── */}
          <h1 className="font-serif text-white overflow-hidden leading-tight">
            {/* Line 1 — wipe up at 1.0s */}
            <motion.span
              className="block overflow-hidden text-[34px] md:text-[56px] tracking-[-0.03em]"
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0, y: 40 }}
              animate={{ clipPath: "inset(0 0 0% 0)",   opacity: 1, y: 0  }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              Your Wedding Story
            </motion.span>

            {/* Line 2 — wipe up at 1.25s (250ms stagger) */}
            <motion.span
              className="block overflow-hidden italic text-[28px] md:text-[36px] tracking-[-0.03em] -mt-1 md:-mt-2"
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0, y: 40 }}
              animate={{ clipPath: "inset(0 0 0% 0)",   opacity: 1, y: 0  }}
              transition={{ duration: 0.9, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "linear-gradient(105deg, #C8A165 0%, #F0D898 40%, #C8A165 70%, #A07840 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Begins Here
            </motion.span>
          </h1>

          {/* ── 3C: Subheading — fades up at 1.5s ── */}
          <motion.p
            className={`${typography.heroSubtitle} text-white/95 font-medium drop-shadow-md max-w-md`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Tell our concierge about your vision, and we will source the perfect
            venues and vendors.
          </motion.p>

          {/* ── 3C: Search Panel — rises at 1.8s ── */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<div className="w-full h-48 bg-white/10 animate-pulse rounded-2xl" />}>
              <HeroForm />
            </Suspense>
          </motion.div>
        </div>

        {/* ── Right Column: Floating Venue Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex w-full lg:w-[42%] xl:w-[38%] items-center justify-center relative min-h-[380px] z-10"
        >
          <HeroFloatingCard />
        </motion.div>
      </div>

    </section>
  );
}
