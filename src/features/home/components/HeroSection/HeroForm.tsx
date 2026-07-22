"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, IndianRupee, Sparkles } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

/* ─────────────────────────────────────────────────────────────────────────────
   Counter: animated number roll-up
───────────────────────────────────────────────────────────────────────────── */
// Counter removed (no fake stats)

// InputField replaced by CustomSelect

/* ─────────────────────────────────────────────────────────────────────────────
   4C: Double-ring sonar pulse
───────────────────────────────────────────────────────────────────────────── */
// SonarDot removed

/* ─────────────────────────────────────────────────────────────────────────────
   4D+4E: Luxury Burgundy Primary Button — liquid shimmer + press state
───────────────────────────────────────────────────────────────────────────── */
function PrimaryButton({
  onClick,
  id,
  children,
}: {
  onClick: () => void;
  id: string;
  children: React.ReactNode;
}) {
  const shimmerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (!shimmerRef.current) return;
    // Reset position so sweep starts from right
    shimmerRef.current.style.transition = "none";
    shimmerRef.current.style.backgroundPosition = "200% center";
    shimmerRef.current.style.opacity = "1";
    // Trigger sweep on next frame
    requestAnimationFrame(() => {
      if (!shimmerRef.current) return;
      shimmerRef.current.style.transition =
        "background-position 600ms ease-in-out";
      shimmerRef.current.style.backgroundPosition = "-200% center";
    });
  };

  const handleMouseLeave = () => {
    if (!shimmerRef.current) return;
    shimmerRef.current.style.transition = "opacity 200ms ease-out";
    shimmerRef.current.style.opacity = "0";
  };

  return (
    <button
      suppressHydrationWarning
      onClick={onClick}
      id={id}
      className="group relative w-full sm:w-auto px-8 min-h-[48px] rounded-xl text-[11px] font-black uppercase tracking-widest text-white overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #7A2033 0%, #6F1D2C 50%, #5C1724 100%)",
        boxShadow: "0 8px 32px -6px rgba(111,29,44,0.60), 0 1px 0 rgba(255,255,255,0.10) inset",
        border: "1px solid rgba(200,161,101,0.25)",
        // 4E: Physical press — defined via CSS class below
        transition: "transform 80ms ease-out, box-shadow 80ms ease-out",
      }}
      // 4E: Lift on hover, press on active
      // 4E: Lift on hover, press on active
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97) translateY(1px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 16px -6px rgba(111,29,44,0.50), 0 1px 0 rgba(255,255,255,0.08) inset";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px -4px rgba(200,161,101,0.30), 0 1px 0 rgba(255,255,255,0.15) inset";
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px -4px rgba(200,161,101,0.30), 0 1px 0 rgba(255,255,255,0.15) inset";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px -6px rgba(111,29,44,0.60), 0 1px 0 rgba(255,255,255,0.10) inset";
      }}
      onMouseEnter={(e) => {
        handleMouseEnter();
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px -4px rgba(200,161,101,0.30), 0 1px 0 rgba(255,255,255,0.15) inset";
      }}
      onMouseLeave={(e) => {
        handleMouseLeave();
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px -6px rgba(111,29,44,0.60), 0 1px 0 rgba(255,255,255,0.10) inset";
      }}
    >
      {/* 4D: Liquid gold shimmer sweep */}
      <span
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(200,161,101,0.38) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "200% center",
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2 py-3.5">
        {children}
        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Glass Secondary Button — lift + press state (4E)
───────────────────────────────────────────────────────────────────────────── */
function SecondaryButton({
  onClick,
  id,
  children,
}: {
  onClick: () => void;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <button
      suppressHydrationWarning
      onClick={onClick}
      id={id}
      className="group relative w-full sm:w-auto px-8 min-h-[48px] rounded-xl text-[11px] font-black uppercase tracking-widest overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(200,161,101,0.45)",
        color: "#E8C97A",
        boxShadow: "0 4px 20px -4px rgba(200,161,101,0.15)",
        transition: "transform 80ms ease-out, box-shadow 150ms ease-out, background 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(200,161,101,0.12)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px -4px rgba(200,161,101,0.25)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px -4px rgba(200,161,101,0.15)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97) translateY(1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px -4px rgba(200,161,101,0.12)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px -4px rgba(200,161,101,0.25)";
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 py-3.5">
        {children}
        <span className="group-hover:translate-x-1 transition-transform duration-300 opacity-70">→</span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HeroForm — main export
───────────────────────────────────────────────────────────────────────────── */
export function HeroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [guests,   setGuests]   = useState(searchParams.get("guests")   || "");
  const [budget,   setBudget]   = useState(searchParams.get("budget")   || "");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (location) params.set("location", location); else params.delete("location");
    if (guests)   params.set("guests",   guests);   else params.delete("guests");
    if (budget)   params.set("budget",   budget);   else params.delete("budget");
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [location, guests, budget, router, searchParams]);

  const handleStartPlanning  = () => document.getElementById("concierge-journey")?.scrollIntoView({ behavior: "smooth" });
  const handleExploreVenues  = () => document.getElementById("featured-venues")?.scrollIntoView({ behavior: "smooth" });

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Helper to format values for the mobile pill
  const mobilePillText = [
    location || "Hyderabad",
    guests || "Guests",
    budget ? `₹${budget.split('-')[0]}L+` : "Budget",
  ].join(" • ");

  return (
    <div className="w-full flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full flex flex-col gap-3 md:gap-4 text-neutral-charcoal relative"
        style={{
          background: "rgba(255, 252, 248, 0.10)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(200, 161, 101, 0.22)",
          borderRadius: "20px",
          padding: "16px 16px 18px",
          boxShadow:
            "0 32px 80px -16px rgba(10, 4, 8, 0.55), 0 0 0 0.5px rgba(200,161,101,0.12) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
        }}
      >
        {/* Internal glass shimmer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[20px] overflow-hidden hidden md:block"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(200,161,101,0.04) 100%)",
          }}
        />

        {/* Input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-20">
          <CustomSelect
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="All Hyderabad Areas"
            options={[
              { value: "", label: "All Hyderabad Areas" },
              { value: "Banjara Hills", label: "Banjara Hills" },
              { value: "Jubilee Hills", label: "Jubilee Hills" },
              { value: "Gachibowli", label: "Gachibowli" },
            ]}
          />

          <CustomSelect
            icon={<Users className="w-4 h-4" />}
            label="Guests Size"
            value={guests}
            onChange={setGuests}
            placeholder="Select size"
            options={[
              { value: "", label: "Select size" },
              { value: "Under 200", label: "Under 200" },
              { value: "200-500", label: "200 - 500" },
              { value: "500-1000", label: "500 - 1000" },
            ]}
          />

          <CustomSelect
            icon={<IndianRupee className="w-4 h-4" />}
            label="Budget Limit"
            value={budget}
            onChange={setBudget}
            placeholder="Select range"
            options={[
              { value: "", label: "Select range" },
              { value: "10-25", label: "₹10L - ₹25 Lakhs" },
              { value: "25-50", label: "₹25L - ₹50 Lakhs" },
              { value: "50-100", label: "₹50L - ₹1 Crore" },
            ]}
          />
        </div>

        {/* Status row - Desktop only */}
        <div
          className="hidden md:flex relative z-10 flex-wrap items-center justify-between gap-3 pt-4 pb-1 text-xs font-bold px-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex flex-wrap items-center gap-6">
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-1.5 text-white/90">
              <span className="text-[#C8A165]">✓</span> Preferences understood
            </motion.span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-1.5 text-white/90">
              <span className="text-[#C8A165]">✓</span> Smart filtering
            </motion.span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-1.5 text-[#C8A165]">
              <Sparkles className="w-3.5 h-3.5" /> Personalized results
            </motion.span>
          </div>
          <div className="text-[9px] text-white/50 uppercase tracking-widest font-black">
            Smart Wedding Discovery
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-1">
          <PrimaryButton onClick={handleExploreVenues} id="hero-cta-discovery">
            <span className="md:hidden">Find Matches</span>
            <span className="hidden md:inline">Find My Matches</span>
          </PrimaryButton>
          <div className="hidden md:block">
            <SecondaryButton onClick={handleExploreVenues} id="hero-cta-venues">
              Explore Collections
            </SecondaryButton>
          </div>
        </div>
      </motion.div>

      {/* Mobile Quick Chips */}
      <div className="md:hidden flex flex-col gap-3 mt-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 ml-1">Popular Searches</span>
        <div className="flex flex-wrap gap-2">
          {["Luxury Venues", "Photographers", "Decor", "Catering", "Makeup"].map((chip) => (
            <button key={chip} className="px-4 py-2 min-h-[48px] rounded-full border border-white/20 bg-white/5 text-white text-xs font-semibold backdrop-blur-sm active:bg-white/10 transition-colors flex items-center justify-center">
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
