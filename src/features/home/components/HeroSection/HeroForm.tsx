"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";

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
    shimmerRef.current.style.transition = "none";
    shimmerRef.current.style.backgroundPosition = "200% center";
    shimmerRef.current.style.opacity = "1";
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
      className="group relative w-full sm:w-auto px-8 min-h-[48px] rounded-xl text-[11px] font-black uppercase tracking-widest text-white overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #7A2033 0%, #6F1D2C 50%, #5C1724 100%)",
        boxShadow: "0 8px 32px -6px rgba(111,29,44,0.60), 0 1px 0 rgba(255,255,255,0.10) inset",
        border: "1px solid rgba(200,161,101,0.25)",
        transition: "transform 80ms ease-out, box-shadow 80ms ease-out",
      }}
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
      className="group relative w-full sm:w-auto px-8 min-h-[48px] rounded-xl text-[11px] font-black uppercase tracking-widest overflow-hidden cursor-pointer"
      style={{
        background: "rgba(10, 5, 8, 0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(200,161,101,0.3)",
        color: "#FDFBF7",
        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.4)",
        transition: "transform 80ms ease-out, box-shadow 150ms ease-out, background 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(10,5,8,0.65)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -4px rgba(200,161,101,0.15)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(10, 5, 8, 0.45)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px -4px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97) translateY(1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px -4px rgba(0,0,0,0.3)";
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
   HeroForm — Action Buttons
───────────────────────────────────────────────────────────────────────────── */
export function HeroForm() {
  const router = useRouter();

  const handleExploreVenues = () => {
    router.push("/venues");
  };

  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
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
  );
}
