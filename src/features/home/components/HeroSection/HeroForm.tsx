"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, IndianRupee } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Counter: animated number roll-up
───────────────────────────────────────────────────────────────────────────── */
function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = value;
    if (displayValue === end) return;
    const duration = 1200;
    const startTime = performance.now();
    const startVal = displayValue;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startVal + ease * (end - startVal)));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(end);
    }
    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{displayValue}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   4A+4B: Luxury Input Field wrapper
   - Focus glow (box-shadow expansion behind the field)
   - Icon colour transitions from burgundy → champagne on focus
───────────────────────────────────────────────────────────────────────────── */
function InputField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 min-h-[54px]"
      style={{
        background: "rgba(255,252,248,0.90)",
        borderRadius: "12px",
        border: `1px solid ${focused ? "rgba(200,161,101,0.45)" : "rgba(200,161,101,0.20)"}`,
        // 4A: Focus glow expands behind the input
        boxShadow: focused
          ? "0 0 0 3px rgba(200,161,101,0.12), 0 4px 16px -4px rgba(200,161,101,0.22)"
          : "none",
        transition: "box-shadow 200ms ease-out, border-color 200ms ease-out",
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {/* 4B: Icon warms to champagne on focus */}
      <span
        style={{
          color: focused ? "#C8A165" : "#6F1D2C",
          transition: "color 200ms ease-out",
          flexShrink: 0,
          display: "flex",
        }}
      >
        {icon}
      </span>
      <div className="flex-grow text-left">
        <span className="text-[9px] font-black text-neutral-muted uppercase tracking-[0.18em] block">
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4C: Double-ring sonar pulse
───────────────────────────────────────────────────────────────────────────── */
function SonarDot() {
  return (
    <span className="relative inline-flex w-2 h-2 shrink-0">
      {/* Static core */}
      <span className="absolute inset-0 rounded-full bg-emerald-400" />
      {/* Ring 1 */}
      <span
        className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping"
        style={{ animationDuration: "1s" }}
      />
      {/* Ring 2 — offset phase */}
      <span
        className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping"
        style={{ animationDuration: "1.5s", animationDelay: "0.75s" }}
      />
    </span>
  );
}

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full sm:w-auto px-8 min-h-[48px] rounded-xl text-[11px] font-black uppercase tracking-widest text-white overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #7A2033 0%, #6F1D2C 50%, #5C1724 100%)",
        boxShadow: "0 8px 32px -6px rgba(111,29,44,0.60), 0 1px 0 rgba(255,255,255,0.10) inset",
        border: "1px solid rgba(200,161,101,0.25)",
        // 4E: Physical press — defined via CSS class below
        transition: "transform 80ms ease-out, box-shadow 80ms ease-out",
      }}
      // 4E: Lift on hover, press on active
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97) translateY(1px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 16px -6px rgba(111,29,44,0.50), 0 1px 0 rgba(255,255,255,0.08) inset";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px -6px rgba(111,29,44,0.75), 0 1px 0 rgba(255,255,255,0.15) inset";
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 40px -6px rgba(111,29,44,0.75), 0 1px 0 rgba(255,255,255,0.15) inset";
      }}
      onBlur={(e) => {
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

  const [venuesCount,  setVenuesCount]  = useState(18);
  const [vendorsCount, setVendorsCount] = useState(42);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (location) params.set("location", location); else params.delete("location");
    if (guests)   params.set("guests",   guests);   else params.delete("guests");
    if (budget)   params.set("budget",   budget);   else params.delete("budget");
    router.replace(`/?${params.toString()}`, { scroll: false });

    let bV = 18, bD = 42;
    if (guests === "Under 200") { bV = 8;  bD = 16; }
    else if (guests === "200-500") { bV = 12; bD = 28; }
    if (location) bV = Math.max(2, Math.floor(bV * 0.4));
    if (budget)   bV = Math.max(1, Math.floor(bV * 0.6));
    setVenuesCount(bV);
    setVendorsCount(bD);
  }, [location, guests, budget, router, searchParams]);

  const handleStartPlanning  = () => document.getElementById("meet-concierge")?.scrollIntoView({ behavior: "smooth" });
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
        className="w-full flex flex-col gap-3 md:gap-4 text-neutral-charcoal relative overflow-hidden"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          <InputField icon={<MapPin className="w-4 h-4" />} label="Location">
            <select
              suppressHydrationWarning
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm font-bold text-neutral-charcoal outline-none w-full mt-0.5 cursor-pointer appearance-none min-h-[32px]"
            >
              <option value="">All Hyderabad Areas</option>
              <option value="Banjara Hills">Banjara Hills</option>
              <option value="Jubilee Hills">Jubilee Hills</option>
              <option value="Gachibowli">Gachibowli</option>
            </select>
          </InputField>

          <InputField icon={<Users className="w-4 h-4" />} label="Guests Size">
            <select
              suppressHydrationWarning
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-sm font-bold text-neutral-charcoal outline-none w-full mt-0.5 cursor-pointer appearance-none min-h-[32px]"
            >
              <option value="">Select size</option>
              <option value="Under 200">Under 200</option>
              <option value="200-500">200 - 500</option>
              <option value="500-1000">500 - 1000</option>
            </select>
          </InputField>

          <InputField icon={<IndianRupee className="w-4 h-4" />} label="Budget Limit">
            <select
              suppressHydrationWarning
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-transparent text-sm font-bold text-neutral-charcoal outline-none w-full mt-0.5 cursor-pointer appearance-none min-h-[32px]"
            >
              <option value="">Select range</option>
              <option value="10-25">₹10L - ₹25 Lakhs</option>
              <option value="25-50">₹25L - ₹50 Lakhs</option>
              <option value="50-100">₹50L - ₹1 Crore</option>
            </select>
          </InputField>
        </div>

        {/* Status row - Desktop only */}
        <div
          className="hidden md:flex relative z-10 flex-wrap items-center justify-between gap-3 pt-3 text-xs font-bold px-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-white/80">
              <SonarDot />
              ✓ <Counter value={venuesCount} /> Curated Recommendations
            </span>
            <span className="flex flex-wrap items-center gap-2 text-[#C8A165]">
              <SonarDot />
              ✓ <Counter value={vendorsCount} /> Concierge Sourced Matches
              <span className="ml-1 inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                Concierge Online
              </span>
            </span>
          </div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider">
            Concierge actively matching requirements
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-1">
          <PrimaryButton onClick={handleStartPlanning} id="hero-cta-specialist">
            <span className="md:hidden">Search</span>
            <span className="hidden md:inline">Talk To A Specialist</span>
          </PrimaryButton>
          <div className="hidden md:block">
            <SecondaryButton onClick={handleExploreVenues} id="hero-cta-venues">
              View Curated Collection
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
