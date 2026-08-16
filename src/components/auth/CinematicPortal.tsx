"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type CinematicPortalProps = {
  mode: "new-user" | "returning-user";
  userName?: string;
  onComplete: () => void;
  onShuttersClosed: () => void;
};

// Refined easing curve for premium motion
const easeInOut = [0.4, 0, 0.2, 1];
const easeOut = [0, 0, 0.2, 1];
const easeCinematic = [0.22, 1, 0.36, 1];

export default function CinematicPortal({ mode, userName, onComplete, onShuttersClosed }: CinematicPortalProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shuttersClosed, setShuttersClosed] = useState(false);

  const onCompleteRef = React.useRef(onComplete);
  const onShuttersClosedRef = React.useRef(onShuttersClosed);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onShuttersClosedRef.current = onShuttersClosed;
  }, [onComplete, onShuttersClosed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    // Call onShuttersClosed around 500ms when the screen is fully black
    const shutterTimer = setTimeout(() => {
      setShuttersClosed(true);
      if (onShuttersClosedRef.current) onShuttersClosedRef.current();
    }, prefersReducedMotion ? 0 : 500);

    // Total duration logic
    const duration = mode === "new-user" ? 3500 : 2300;
    
    const timer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, prefersReducedMotion ? 1000 : duration);

    return () => {
      clearTimeout(shutterTimer);
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [mode, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A0D0C] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[#FDFBF7] font-serif text-2xl flex flex-col items-center gap-4"
        >
          <span className="text-[12px] tracking-[0.3em] text-[#C6934A] uppercase font-semibold">YouMarriage</span>
          <span>{mode === "new-user" ? "YOUR WEDDING. YOUR WAY." : "WELCOME BACK"}</span>
        </motion.div>
      </div>
    );
  }

  const panels = Array.from({ length: isMobile ? 3 : 5 });

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      
      {/* ── PHASE 1: CINEMATIC SHUTTERS (0.0s - 0.5s) ── */}
      <div className="absolute inset-0 flex w-full h-full">
        {panels.map((_, i) => (
          <motion.div
            key={`shutter-${i}`}
            className="h-full bg-[#0A0D0C] relative border-r border-[#C6934A]/5" // very subtle seam
            style={{ width: `${100 / panels.length}%` }}
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.4,
              delay: i * 0.04,
              ease: easeInOut,
            }}
          />
        ))}
      </div>

      {/* The rest of the portal only plays inside the black background after shutters close to avoid layering issues */}
      <AnimatePresence>
        {shuttersClosed && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {/* ── PHASE 4 & 11: PORTAL DOORS (Emerald Background) ── */}
            {/* Left Door */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-[#0C1210] origin-right flex justify-end overflow-hidden"
              initial={{ width: "50%" }}
              animate={
                mode === "new-user"
                  ? { width: ["0%", "50%", "50%", "0%"] }
                  : { width: ["0%", "50%", "50%", "0%"] }
              }
              transition={
                mode === "new-user"
                  ? { times: [0, 0.14, 0.85, 1], duration: 3.5 - 0.5, ease: easeInOut }
                  : { times: [0, 0.22, 0.72, 1], duration: 1.8, ease: easeInOut }
              }
              style={{ borderRight: "1px solid rgba(198, 147, 74, 0.1)" }}
            >
              {/* Image Fragments (Left side of portal) */}
              {mode === "new-user" && (
                <motion.div
                  className="absolute right-[20%] md:right-[50%] top-[25%] w-24 h-36 md:w-48 md:h-64 z-10"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [-30, 0, 0, 0] }}
                  transition={{ times: [0, 0.2, 0.8, 1], duration: 1.15, delay: 1.3 - 0.5, ease: easeOut }}
                >
                  <Image src="/images/editorial/venue_1.png" alt="Venue" fill className="object-cover opacity-80 mix-blend-luminosity" sizes="200px" />
                </motion.div>
              )}
            </motion.div>

            {/* Right Door */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 bg-[#0C1210] origin-left flex justify-start overflow-hidden"
              initial={{ width: "50%" }}
              animate={
                mode === "new-user"
                  ? { width: ["0%", "50%", "50%", "0%"] }
                  : { width: ["0%", "50%", "50%", "0%"] }
              }
              transition={
                mode === "new-user"
                  ? { times: [0, 0.14, 0.85, 1], duration: 3.5 - 0.5, ease: easeInOut }
                  : { times: [0, 0.22, 0.72, 1], duration: 1.8, ease: easeInOut }
              }
              style={{ borderLeft: "1px solid rgba(198, 147, 74, 0.1)" }}
            >
              {/* Image Fragments (Right side of portal) */}
              {mode === "new-user" && (
                <motion.div
                  className="absolute left-[20%] md:left-[50%] bottom-[20%] w-20 h-28 md:w-36 md:h-56 z-10"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [30, 0, 0, 0] }}
                  transition={{ times: [0, 0.2, 0.8, 1], duration: 1.15, delay: 1.5 - 0.5, ease: easeOut }}
                >
                  <Image src="/images/editorial/vendor_catering.png" alt="Vendor" fill className="object-cover opacity-80 mix-blend-luminosity" sizes="200px" />
                </motion.div>
              )}
            </motion.div>

            {/* Central Inspiration Image (Appears across both doors if needed) */}
            {mode === "new-user" && (
              <motion.div
                className="absolute z-10 w-16 h-24 md:w-32 md:h-48 mt-[20vh] ml-[10vw]"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [1.05, 1, 1, 1] }}
                transition={{ times: [0, 0.2, 0.8, 1], duration: 1.05, delay: 1.7 - 0.5, ease: easeOut }}
              >
                <Image src="/images/editorial/insp_bridal.png" alt="Inspiration" fill className="object-cover opacity-70 mix-blend-luminosity" sizes="200px" />
              </motion.div>
            )}

            {/* ── PHASE 3: THE CHAMPAGNE LIGHT (0.75s - 1.1s) ── */}
            {/* It appears and then vanishes as the doors open */}
            <motion.div
              className="absolute w-[1px] bg-[#C6934A] z-20"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: ["0vh", "75vh", "75vh", "75vh"], opacity: [0, 1, 1, 0] }}
              transition={{ times: [0, 0.5, 0.8, 1], duration: 0.6, delay: 0.75 - 0.5, ease: easeOut }}
            />

            {/* ── NEW USER TYPOGRAPHY SEQUENCE ── */}
            {mode === "new-user" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
                
                {/* YOUMARRIAGE BRAND (1.65s - 2.45s) */}
                <motion.div
                  className="absolute flex flex-col items-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] }}
                  transition={{ times: [0, 0.3, 0.7, 1], duration: 0.8, delay: 1.65 - 0.5, ease: easeOut }}
                >
                  <div className="text-[12px] md:text-sm tracking-[0.4em] text-[#FDFBF7] font-semibold uppercase">
                    YouMarriage
                  </div>
                </motion.div>

                {/* PRODUCT WORDS (1.8s - 2.45s) */}
                <motion.div
                  className="absolute flex items-center justify-center gap-3 md:gap-6 mt-16 font-serif text-[10px] md:text-[13px] text-[#C6934A] tracking-widest uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ times: [0, 0.3, 0.7, 1], duration: 0.8, delay: 1.8 - 0.5, ease: easeOut }}
                >
                  <motion.span initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5, delay: 1.8 - 0.5, ease: easeOut }}>Venues</motion.span>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 2.0 - 0.5 }}>·</motion.span>
                  <motion.span initial={{ y: 10 }} animate={{ y: 0 }} transition={{ duration: 0.5, delay: 1.8 - 0.5, ease: easeOut }}>Vendors</motion.span>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 2.0 - 0.5 }}>·</motion.span>
                  <motion.span initial={{ x: 20 }} animate={{ x: 0 }} transition={{ duration: 0.5, delay: 1.8 - 0.5, ease: easeOut }}>Inspiration</motion.span>
                </motion.div>

                {/* BIG STATEMENT & SIGNATURE LINE (2.55s - 3.15s) */}
                <motion.div
                  className="absolute flex flex-col items-center text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ times: [0, 0.15, 0.85, 1], duration: 0.6, delay: 2.55 - 0.5, ease: easeCinematic }}
                >
                  <h2 className="font-serif text-[30px] md:text-[52px] lg:text-[64px] leading-[1.1] text-[#FDFBF7] mb-5">
                    YOUR WEDDING.<br/>YOUR WAY.
                  </h2>
                  <motion.div 
                    className="h-[1px] bg-[#C6934A]"
                    initial={{ width: 0 }}
                    animate={{ width: isMobile ? 80 : 140 }}
                    transition={{ duration: 0.35, delay: 2.8 - 0.5, ease: easeOut }}
                  />
                </motion.div>

              </div>
            )}

            {/* ── RETURNING USER TYPOGRAPHY SEQUENCE ── */}
            {mode === "returning-user" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
                
                {/* YOUMARRIAGE (1.05s) */}
                <motion.div
                  className="text-[10px] md:text-xs tracking-[0.4em] text-[#C6934A] font-semibold uppercase mb-6"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [5, 0, 0, 0] }}
                  transition={{ times: [0, 0.2, 0.8, 1], duration: 0.75, delay: 1.05 - 0.5, ease: easeOut }}
                >
                  YouMarriage
                </motion.div>

                {/* WELCOME BACK (1.2s) */}
                <motion.h2
                  className="font-serif text-[28px] md:text-[42px] leading-[1.1] text-[#FDFBF7] mb-3 text-center px-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, 0] }}
                  transition={{ times: [0, 0.2, 0.8, 1], duration: 0.75, delay: 1.2 - 0.5, ease: easeOut }}
                >
                  {userName ? `WELCOME BACK, ${userName.toUpperCase()}.` : "WELCOME BACK."}
                </motion.h2>

                {/* STORY CONTINUES (1.3s) */}
                <motion.p
                  className="text-xs md:text-sm text-[#FDFBF7]/60 font-light tracking-widest"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ times: [0, 0.2, 0.8, 1], duration: 0.65, delay: 1.3 - 0.5, ease: easeOut }}
                >
                  YOUR STORY CONTINUES.
                </motion.p>
                
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
