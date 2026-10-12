"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, Building2, Camera, Palette, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

type CinematicPortalProps = {
  mode: "new-user" | "returning-user";
  userName?: string;
  onComplete: () => void;
  onShuttersClosed: () => void;
};

// Custom luxury spring and easing
const easeGate = [0.19, 1, 0.22, 1];
const easeCinematic = [0.16, 1, 0.3, 1];

const PLATFORM_PILLARS = [
  {
    id: "venues",
    title: "Curated Venues",
    count: "200+ Spaces",
    tags: "Palaces · Resorts · Lawns",
    icon: Building2,
    image: "/images/editorial/venue_1.png",
    accent: "#C8A165",
  },
  {
    id: "vendors",
    title: "Verified Vendors",
    count: "500+ Curators",
    tags: "Photo · Decor · Makeup",
    icon: Camera,
    image: "/images/editorial/vendor_photography.png",
    accent: "#8B263E",
  },
  {
    id: "inspiration",
    title: "Inspiration & Themes",
    count: "1000+ Concepts",
    tags: "Themes · Real Stories",
    icon: Palette,
    image: "/images/editorial/insp_bridal.png",
    accent: "#C8A165",
  },
  {
    id: "studio",
    title: "Wedding Studio",
    count: "Digital Suite",
    tags: "eInvites · RSVP · Web",
    icon: Mail,
    image: "/images/editorial/vendor_catering.png",
    accent: "#8B263E",
  },
];

export default function CinematicPortal({
  mode,
  userName,
  onComplete,
  onShuttersClosed,
}: CinematicPortalProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<"sealed" | "swinging" | "revealed" | "warp">("sealed");

  const onCompleteRef = useRef(onComplete);
  const onShuttersClosedRef = useRef(onShuttersClosed);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onShuttersClosedRef.current = onShuttersClosed;
  }, [onComplete, onShuttersClosed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Call onShuttersClosed early to unmount underlying auth forms
    const shutterTimer = setTimeout(() => {
      if (onShuttersClosedRef.current) onShuttersClosedRef.current();
    }, prefersReducedMotion ? 0 : 250);

    // Phase 1: Gates swing open in 3D (350ms)
    const swingTimer = setTimeout(() => {
      setPhase("swinging");
    }, prefersReducedMotion ? 0 : 350);

    // Phase 2: Showcase cards float in (650ms)
    const revealTimer = setTimeout(() => {
      setPhase("revealed");
    }, prefersReducedMotion ? 0 : 650);

    // Phase 3: Cinematic camera glide forward (2100ms)
    const warpTimer = setTimeout(() => {
      setPhase("warp");
    }, prefersReducedMotion ? 600 : 2100);

    // Phase 4: Complete navigation (2500ms)
    const completeTimer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, prefersReducedMotion ? 800 : 2500);

    return () => {
      clearTimeout(shutterTimer);
      clearTimeout(swingTimer);
      clearTimeout(revealTimer);
      clearTimeout(warpTimer);
      clearTimeout(completeTimer);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0204] flex flex-col items-center justify-center text-center p-6">
        <span className="text-[11px] tracking-[0.3em] text-[#C8A165] uppercase font-bold mb-2">
          {mode === "new-user" ? "✦ WELCOME TO WE ARRANGE ✦" : "✦ WELCOME BACK ✦"}
        </span>
        <h2 className="text-white font-serif text-2xl mb-2">
          {mode === "new-user"
            ? "Your Wedding Story Begins Here"
            : `Welcome Back${userName ? `, ${userName}` : ""}`}
        </h2>
      </div>
    );
  }

  const displayName = userName
    ? userName.trim().split(" ")[0].charAt(0).toUpperCase() + userName.trim().split(" ")[0].slice(1)
    : "";

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto flex items-center justify-center bg-[#060102]">
      
      {/* ── BACKGROUND SANCTUARY (Revealed Behind the 3D Doors) ── */}
      <motion.div
        className="absolute inset-0 z-0 flex flex-col items-center justify-center"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{
          scale: phase === "warp" ? 1.18 : phase === "revealed" || phase === "swinging" ? 1 : 0.94,
          opacity: phase === "warp" ? [1, 0] : phase === "revealed" || phase === "swinging" ? 1 : 0.2,
        }}
        transition={{ duration: 0.7, ease: easeCinematic }}
      >
        {/* Volumetric Radial Aura & Sunburst Rays */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(232,200,117,0.3) 0%, rgba(139,38,62,0.22) 40%, rgba(6,1,2,0.95) 75%)",
          }}
        />

        {/* Ambient Floating Light Sparks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute rounded-full bg-[#E8C875]"
              style={{
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                left: `${10 + ((i * 17) % 80)}%`,
                top: `${25 + ((i * 29) % 55)}%`,
                boxShadow: "0 0 12px 2px rgba(232,200,117,0.7)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0, 0.9, 0],
                y: [-10, -60],
              }}
              transition={{
                duration: 1.4 + (i % 3) * 0.3,
                delay: 0.2 + (i * 0.07),
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Main Platform Showcase Deck */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{
              opacity: phase === "revealed" || phase === "warp" ? 1 : 0,
              y: phase === "revealed" || phase === "warp" ? 0 : -24,
            }}
            transition={{ duration: 0.55, delay: 0.1, ease: easeCinematic }}
            className="mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-[#C8A165]/40 backdrop-blur-md mb-3 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[#E8C875] animate-spin" style={{ animationDuration: "5s" }} />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-[#E8C875]">
                {mode === "new-user" ? "Welcome To We Arrange" : "Welcome Back"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-medium tracking-tight leading-tight mb-2">
              {mode === "new-user" ? (
                <>Your Wedding Journey <span className="bg-gradient-to-r from-[#E8C875] via-[#FFF3D6] to-[#C8A165] bg-clip-text text-transparent">Begins Here</span></>
              ) : (
                <>{displayName ? `Hello, ${displayName}` : "Welcome Back"} · <span className="bg-gradient-to-r from-[#E8C875] via-[#FFF3D6] to-[#C8A165] bg-clip-text text-transparent">Workspace Ready</span></>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto font-light">
              Hyderabad&apos;s premier venues, verified vendors, curated aesthetics, and RSVP suite.
            </p>
          </motion.div>

          {/* 4 Interactive Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full max-w-4xl mb-6 md:mb-8">
            {PLATFORM_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 35, scale: 0.88 }}
                  animate={{
                    opacity: phase === "revealed" || phase === "warp" ? 1 : 0,
                    y: phase === "revealed" || phase === "warp" ? 0 : 35,
                    scale: phase === "revealed" || phase === "warp" ? 1 : 0.88,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + idx * 0.08,
                    ease: easeCinematic,
                  }}
                  className="group relative bg-gradient-to-b from-[#1E0A12]/90 to-[#120409]/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-[#C8A165]/35 shadow-[0_12px_35px_rgba(0,0,0,0.6)] flex flex-col text-left overflow-hidden hover:border-[#E8C875] transition-all duration-300"
                >
                  {/* Photo Preview Container */}
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-neutral-950 border border-white/10 shadow-inner">
                    <Image
                      src={pillar.image}
                      alt={pillar.title}
                      fill
                      sizes="(max-width: 768px) 160px, 220px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Floating Pillar Icon */}
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#8B263E] border border-[#E8C875]/60 flex items-center justify-center shadow-md">
                      <Icon className="w-3.5 h-3.5 text-[#E8C875]" />
                    </div>

                    {/* Metric Count Badge */}
                    <div className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-wider text-[#E8C875]">
                      {pillar.count}
                    </div>
                  </div>

                  {/* Title & Tags */}
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white mb-0.5 leading-snug group-hover:text-[#E8C875] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold leading-tight truncate">
                    {pillar.tags}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Readiness Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === "revealed" || phase === "warp" ? 1 : 0,
              y: phase === "revealed" || phase === "warp" ? 0 : 10,
            }}
            transition={{ duration: 0.45, delay: 0.5 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B263E]/40 border border-[#E8C875]/30 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-[#E8C875]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#E8C875]" />
            <span>Concierge Suite Unlocked · Entering Platform</span>
            <ArrowRight className="w-3.5 h-3.5 animate-pulse ml-1" />
          </motion.div>

        </div>
      </motion.div>

      {/* ── 3D PERSPECTIVE ROYAL GATES / DOORS (Swing Outwards) ── */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none flex"
        style={{ perspective: "1400px" }}
      >
        
        {/* LEFT 3D GATE */}
        <motion.div
          className="w-1/2 h-full bg-gradient-to-r from-[#0C0205] via-[#140509] to-[#1F0810] border-r-2 border-[#E8C875] flex items-center justify-end overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.9)] origin-left"
          initial={{ rotateY: 0, opacity: 1 }}
          animate={{
            rotateY: phase === "sealed" ? 0 : -95,
            opacity: phase === "sealed" ? 1 : phase === "swinging" ? 0.95 : 0,
          }}
          transition={{
            duration: 1.1,
            ease: easeGate,
          }}
        >
          {/* Left Door Monogram & Ornate Gold Filigree Frame */}
          <div className="relative pr-8 flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[#E8C875]/60 bg-[#16050B] flex items-center justify-center shadow-[0_0_30px_rgba(200,161,101,0.3)]">
              <span className="font-serif text-4xl md:text-5xl font-black bg-gradient-to-tr from-[#E8C875] via-[#FFF5DE] to-[#C8A165] bg-clip-text text-transparent">
                Y
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C8A165] font-bold mt-3">
              YOU MARRIAGE
            </span>
          </div>

          <div className="absolute inset-y-0 right-4 w-px bg-gradient-to-b from-transparent via-[#E8C875]/40 to-transparent" />
        </motion.div>

        {/* RIGHT 3D GATE */}
        <motion.div
          className="w-1/2 h-full bg-gradient-to-l from-[#0C0205] via-[#140509] to-[#1F0810] border-l-2 border-[#E8C875] flex items-center justify-start overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.9)] origin-right"
          initial={{ rotateY: 0, opacity: 1 }}
          animate={{
            rotateY: phase === "sealed" ? 0 : 95,
            opacity: phase === "sealed" ? 1 : phase === "swinging" ? 0.95 : 0,
          }}
          transition={{
            duration: 1.1,
            ease: easeGate,
          }}
        >
          {/* Right Door Monogram & Ornate Gold Filigree Frame */}
          <div className="relative pl-8 flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[#E8C875]/60 bg-[#16050B] flex items-center justify-center shadow-[0_0_30px_rgba(200,161,101,0.3)]">
              <span className="font-serif text-4xl md:text-5xl font-black bg-gradient-to-tr from-[#E8C875] via-[#FFF5DE] to-[#C8A165] bg-clip-text text-transparent">
                W
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C8A165] font-bold mt-3">
              WE ARRANGE
            </span>
          </div>

          <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-[#E8C875]/40 to-transparent" />
        </motion.div>

      </div>

      {/* ── CENTER GOLDEN BEAM LASER SEAM ── */}
      <motion.div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-40 w-[3px] bg-gradient-to-b from-transparent via-[#FFF8E7] to-transparent shadow-[0_0_20px_rgba(255,248,231,1)]"
        initial={{ opacity: 1, scaleY: 1 }}
        animate={{
          opacity: phase === "sealed" ? 1 : 0,
          scaleY: phase === "sealed" ? 1 : 1.4,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* ── CINEMATIC DISSOLVE OVERLAY (During Warp to Homepage) ── */}
      <motion.div
        className="absolute inset-0 z-50 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === "warp" ? [0, 0.75, 0] : 0,
        }}
        transition={{ duration: 0.4, ease: easeCinematic }}
      />

    </div>
  );
}
