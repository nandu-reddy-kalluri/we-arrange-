"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MapPin, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/mock-data/venues";
import { DEFAULT_VENUE_IMAGE } from "@/services/catalog/catalogMappers";

const ROTATION_INTERVAL = 8000;

function formatHeroPrice(priceOnwards: string): string {
  const trimmed = (priceOnwards || "").trim();
  if (!trimmed || trimmed.toLowerCase().includes("request")) {
    return "Price on Request";
  }
  return /^[\d,.]+$/.test(trimmed) ? `₹ ${trimmed} Onwards` : trimmed;
}

export function HeroFloatingCard({ venues = [] }: { venues?: Venue[] }) {
  const displayVenues = React.useMemo(
    () => venues.filter((v) => v.imageUrl && v.slug),
    [venues]
  );
  const [mounted, setMounted] = useState(false);
  const [venueIdx, setVenueIdx] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Progress bar state
  const progressRef = useRef<HTMLDivElement>(null);
  const progressStartRef = useRef<number>(0);
  const progressRafRef = useRef<number>(0);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });
  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    setMounted(true);

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", handlePointerMove);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      mq.removeEventListener("change", onMqChange);
    };
  }, [mouseX, mouseY]);

  // Progress bar animation using rAF for precision
  const startProgress = () => {
    if (!progressRef.current) return;
    cancelAnimationFrame(progressRafRef.current);
    progressRef.current.style.transition = "none";
    progressRef.current.style.width = "0%";
    // Force reflow
    void progressRef.current.offsetWidth;
    progressStartRef.current = performance.now();

    const tick = (now: number) => {
      if (!progressRef.current) return;
      const elapsed = now - progressStartRef.current;
      const pct = Math.min((elapsed / ROTATION_INTERVAL) * 100, 100);
      progressRef.current.style.width = `${pct}%`;
      if (pct < 100) progressRafRef.current = requestAnimationFrame(tick);
    };
    progressRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!mounted || displayVenues.length <= 1) return;

    startProgress();
    const interval = setInterval(() => {
      setVenueIdx((prev) => (prev < displayVenues.length - 1 ? prev + 1 : 0));
    }, ROTATION_INTERVAL);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(progressRafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, displayVenues.length]);

  // Restart progress bar on venue change
  useEffect(() => {
    if (mounted && displayVenues.length > 0) startProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueIdx, displayVenues.length]);

  if (displayVenues.length === 0) {
    return null;
  }

  const activeVenue = displayVenues[venueIdx % displayVenues.length];
  const locationLabel =
    activeVenue.location &&
    activeVenue.city &&
    activeVenue.location.toLowerCase() !== activeVenue.city.toLowerCase()
      ? `${activeVenue.location}, ${activeVenue.city}`
      : activeVenue.city || activeVenue.location || "Hyderabad";
  const resolvedImage =
    brokenImages[activeVenue.id] || !activeVenue.imageUrl
      ? DEFAULT_VENUE_IMAGE
      : activeVenue.imageUrl;

  // 2C: Cinematic blur-dissolve transition variants
  const cardVariants = {
    initial: { opacity: 0,  y: 12,  filter: "blur(4px)", scale: 0.98 },
    animate: { opacity: 1,  y: 0,   filter: "blur(0px)", scale: 1    },
    exit:    { opacity: 0,  y: -8,  filter: "blur(2px)", scale: 1.01 },
  };

  return (
    <div className="relative w-full">
      {/* 2B: Breathing ambient glow — pulses on same 6s rhythm as card float */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: "-40px", zIndex: 0 }}
        animate={
          isReducedMotion
            ? { opacity: 0.10 }
            : { opacity: [0.08, 0.20, 0.08], scale: [1, 1.10, 1] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 55% 45%, rgba(200,161,101,0.28) 0%, rgba(200,161,101,0.10) 50%, transparent 75%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

      {/* 2A: Autonomous float wrapper — y:[0,-8,0] + gentle rotation */}
      <motion.div
        className="relative z-10 w-full"
        animate={
          isReducedMotion
            ? {}
            : { y: [0, -8, 0], rotate: [0, 0.4, -0.3, 0] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Cursor parallax sits INSIDE the float — additive */}
        <motion.div
          style={!isReducedMotion ? { x: parallaxX, y: parallaxY } : {}}
          className="w-full"
        >
          <AnimatePresence mode="wait">
            {mounted && (
              <motion.div
                key={venueIdx}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-full select-none"
                style={{
                  background: "rgba(255, 252, 248, 0.97)",
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  border: "1px solid rgba(200,161,101,0.30)",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow: [
                    "0 32px 80px -12px rgba(10,4,8,0.65)",
                    "0 12px 32px -8px rgba(111,29,44,0.25)",
                    "0 0 0 0.5px rgba(200,161,101,0.15) inset",
                    "0 1px 0 rgba(255,255,255,0.60) inset",
                  ].join(", "),
                }}
              >
                {/* Internal glass shimmer */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ borderRadius: "20px" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.50) 0%, transparent 55%, rgba(200,161,101,0.06) 100%)",
                    }}
                  />
                </div>

                {/* Venue Image */}
                <Link
                  href={`/venues/${activeVenue.slug}`}
                  className="block group focus:outline-none"
                  aria-label={`Explore ${activeVenue.name}`}
                >
                <div className="relative aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-neutral-cream z-10 mb-4">
                  <Image
                    src={resolvedImage}
                    alt={activeVenue.name}
                    fill
                    priority={venueIdx === 0}
                    unoptimized={resolvedImage.endsWith(".svg")}
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    quality={80}
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [activeVenue.id]: true }))
                    }
                  />
                  {/* Image inner depth shadow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: "inset 0 -32px 40px -8px rgba(10,4,8,0.30)" }}
                  />
                  <div
                    className="absolute top-3 left-3 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded"
                    style={{
                      background: "rgba(111,29,44,0.92)",
                      color: "#C8A165",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Concierge Vetted
                  </div>
                </div>

                {/* Venue Details */}
                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal leading-tight truncate group-hover:text-[#6F1D2C] transition-colors">
                      {activeVenue.name}
                    </h3>
                    {activeVenue.rating > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-charcoal shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#C8A165]" style={{ color: "#C8A165" }} />
                        <span>{activeVenue.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#6F1D2C" }} />
                    <span className="truncate">{locationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-muted">
                    <Users className="w-3.5 h-3.5 shrink-0" style={{ color: "#C8A165" }} />
                    <span>{activeVenue.capacityRange}</span>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="relative z-10 pt-3 mt-2 flex items-center justify-between text-xs"
                  style={{ borderTop: "1px solid rgba(200,161,101,0.18)" }}
                >
                  <div>
                    <span className="block text-[8px] uppercase font-black text-neutral-muted tracking-wider">
                      Est. Budget
                    </span>
                    <span className="block text-[13px] font-black" style={{ color: "#6F1D2C" }}>
                      {formatHeroPrice(activeVenue.priceOnwards)}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg"
                    style={{
                      color: "#C8A165",
                      background: "rgba(200,161,101,0.08)",
                      border: "1px solid rgba(200,161,101,0.20)",
                    }}
                  >
                    {activeVenue.type || "Premium Venue"}
                  </span>
                </div>
                </Link>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
