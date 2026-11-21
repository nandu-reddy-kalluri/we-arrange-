"use client";

import React, { Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroBackdrop } from "./BackgroundSystem";
import { HeroForm } from "./HeroForm";
import { HeroFloatingCard } from "./HeroFloatingCard";

import type { Venue } from "@/mock-data/venues";
import { layout, spacing, typography, motionTokens, icons, zIndex } from "@/styles";

export default function HeroSection({ heroVenues = [] }: { heroVenues?: Venue[] }) {
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

          {/* ── Eyebrow label ── */}
          <div className="flex items-center gap-3 overflow-hidden">
            <span
              className="block h-px bg-gradient-to-r from-[#C8A165] to-transparent origin-left"
              style={{ width: 32 }}
            />
            <span className="font-sans text-[10px] sm:text-[11px] font-black uppercase text-[#C8A165] tracking-[0.25em]">
              DREAM • Hyderabad&apos;s Elite Wedding Concierge
            </span>
          </div>

          {/* ── 3A: Headline ── */}
          <h1 className="font-serif text-white overflow-hidden leading-tight">
            <span className="block text-[34px] md:text-[56px] tracking-[-0.03em]">
              Your Wedding Story
            </span>
            <span
              className="block italic text-[28px] md:text-[36px] tracking-[-0.03em] -mt-1 md:-mt-2"
              style={{
                background: "linear-gradient(105deg, #C8A165 0%, #F0D898 40%, #C8A165 70%, #A07840 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Begins Here
            </span>
          </h1>

          {/* ── 3C: Subheading ── */}
          <p className={`${typography.heroSubtitle} text-white/95 font-medium drop-shadow-md max-w-md`}>
            Tell our concierge about your vision, and we will source the perfect
            venues and vendors.
          </p>

          {/* ── 3C: Action CTAs ── */}
          <div className="w-full">
            <Suspense fallback={<div className="w-full sm:w-80 h-12 bg-white/10 animate-pulse rounded-xl" />}>
              <HeroForm />
            </Suspense>
          </div>
        </div>

        {/* ── Right Column: Floating Venue Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex w-full lg:w-[42%] xl:w-[38%] items-center justify-center relative min-h-[380px] z-10"
        >
          <HeroFloatingCard venues={heroVenues} />
        </motion.div>
      </div>

    </section>
  );
}
