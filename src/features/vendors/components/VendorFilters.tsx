"use client";

import React from "react";
import {
  X,
  Check,
  RotateCcw,
  Filter,
  ChevronDown,
  Star,
  MapPin,
  Building2,
  Trees,
  Palmtree,
  Castle,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { vendorCategories, mockVendors } from "@/mock-data/vendors";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  category: string;
  city: string;
  budgetTier: string;
  rating: string;
  experience: string;
  availability: string;
  isVerified: boolean;
  spaceType: string;
  sortBy: string;
  minPrice: number;
  maxPrice: number;
}

interface VendorFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation Variants (module-level — never recreated)
// ─────────────────────────────────────────────────────────────────────────────

const sidebarVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 140, damping: 20 },
  },
};

const accordionVariants = {
  open: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  closed: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const chipTapVariants = {
  tap: { scale: 0.95 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format price lakhs → label
// ─────────────────────────────────────────────────────────────────────────────

const fmtBubble = (val: number) =>
  val < 1 ? `₹${Math.round(val * 100)}K` : `₹${val}L`;

// ─────────────────────────────────────────────────────────────────────────────
// CollapsibleSection — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection = React.memo(function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-1 text-left focus:outline-none group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A880] group-hover:text-[#8B263E] transition-colors duration-250">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#8B263E] transition-colors duration-250" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            variants={accordionVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FilterCard — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────

interface FilterCardProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterCard = React.memo(function FilterCard({
  title,
  isOpen,
  onToggle,
  children,
}: FilterCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        borderColor: "rgba(197,168,128,0.45)",
        boxShadow: "0 6px 18px rgba(197,168,128,0.08)",
        backgroundColor: "rgba(255,255,255,0.98)",
        scale: 1.008,
      }}
      transition={{ duration: 0.22 }}
      className="bg-white/95 border border-gray-150 rounded-[14px] px-3 py-2.5 transition-colors duration-250"
    >
      <CollapsibleSection title={title} isOpen={isOpen} onToggle={onToggle}>
        {children}
      </CollapsibleSection>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SearchableCitySelect — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────

interface SearchableCitySelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

const SearchableCitySelect = React.memo(function SearchableCitySelect({
  value,
  onChange,
  options,
  placeholder,
}: SearchableCitySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [recentCities, setRecentCities] = React.useState<string[]>(["Hyderabad", "Goa"]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = React.useCallback(
    (city: string) => {
      onChange(city);
      setIsOpen(false);
      setSearchTerm("");
      if (city && !recentCities.includes(city)) {
        setRecentCities((prev) => [city, ...prev.slice(0, 2)]);
      }
    },
    [onChange, recentCities]
  );

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sorted = [
    ...recentCities.filter(
      (c) => options.includes(c) && c.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    ...filteredOptions.filter((o) => !recentCities.includes(o)),
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-charcoal focus:border-[#C5A880] focus:outline-none flex items-center justify-between transition-all duration-220 hover:border-[#C5A880] hover:shadow-[0_4px_12px_rgba(197,168,128,0.1)] hover:bg-[#FAF9F6] shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
          <span className={value ? "text-neutral-charcoal font-semibold text-[11px]" : "text-gray-400 text-[11px]"}>
            {value || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-50 left-0 right-0 bg-white border border-[#C5A880]/20 rounded-xl shadow-[0_12px_32px_rgba(197,168,128,0.15)] overflow-hidden flex flex-col max-h-60"
          >
            <div className="p-1.5 border-b border-gray-100 flex items-center gap-1.5 bg-gray-50/50">
              <MapPin className="w-3 h-3 text-[#C5A880]" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-[11px] text-neutral-charcoal focus:outline-none placeholder-gray-400"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto max-h-48 py-1">
              {/* All Cities option */}
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3 py-2 text-[11px] hover:bg-[#FAF9F6] transition-colors flex items-center justify-between cursor-pointer ${
                  value === "" ? "font-bold text-[#8B263E] bg-[#FAF9F6]" : "text-neutral-charcoal"
                }`}
              >
                <span>All Cities</span>
                {value === "" && <Check className="w-3 h-3 text-[#8B263E]" />}
              </button>

              {sorted.map((opt, i) => {
                const isRecent = recentCities.includes(opt) && value !== opt;
                return (
                  <motion.button
                    key={opt}
                    type="button"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.15 }}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-[11px] hover:bg-[#FAF9F6] transition-colors flex items-center justify-between cursor-pointer ${
                      value === opt ? "font-bold text-[#8B263E] bg-[#FAF9F6]" : "text-neutral-charcoal"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3 h-3 ${isRecent ? "text-gray-300" : "text-[#C5A880]"}`} />
                      <span>{opt}</span>
                      {isRecent && (
                        <span className="text-[8px] font-bold uppercase text-[#C5A880] tracking-wider bg-[#FAF9F6] border border-[#C5A880]/20 px-1 rounded">
                          Recent
                        </span>
                      )}
                    </div>
                    {value === opt && <Check className="w-3 h-3 text-[#8B263E]" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// StarRatingSelector — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────

interface StarRatingSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const RATINGS = [
  { value: "4.8", label: "4.8+", stars: 5 },
  { value: "4.5", label: "4.5+", stars: 4 },
  { value: "4.0", label: "4.0+", stars: 3 },
];

const StarRatingSelector = React.memo(function StarRatingSelector({
  value,
  onChange,
}: StarRatingSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 pt-0.5">
      <div className="flex items-center justify-between h-4">
        <span className="text-[10px] font-semibold text-neutral-muted">
          {value ? `${value}+ Stars` : "Select Minimum"}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[9px] font-bold text-[#8B263E] hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {RATINGS.map(({ value: rate, label }, idx) => {
          const isSelected = value === rate;
          return (
            <motion.button
              key={rate}
              type="button"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange(isSelected ? "" : rate)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all duration-220 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-[#C5A880] to-[#E5C8A0] text-white border-transparent shadow-[0_4px_12px_rgba(197,168,128,0.35)]"
                  : "bg-white text-neutral-charcoal border-gray-200 hover:border-[#C5A880] hover:bg-[#FAF9F6]"
              }`}
            >
              <motion.div
                animate={
                  isSelected
                    ? { scale: [1, 1.3, 1], rotate: [0, -8, 0] }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "fill-white text-white" : "text-[#C5A880] fill-[#C5A880]"
                  }`}
                />
              </motion.div>
              <span>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleRangeSlider — module-level, memoized
// Dragging NEVER updates parent. onChange only fires on mouseUp/touchEnd.
// ─────────────────────────────────────────────────────────────────────────────

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}

const DoubleRangeSlider = React.memo(function DoubleRangeSlider({
  min,
  max,
  step,
  minVal,
  maxVal,
  onChange,
}: DoubleRangeSliderProps) {
  const [localMin, setLocalMin] = React.useState(minVal);
  const [localMax, setLocalMax] = React.useState(maxVal);
  const [draggingMin, setDraggingMin] = React.useState(false);
  const [draggingMax, setDraggingMax] = React.useState(false);

  // Sync only when parent resets (e.g. Clear All)
  React.useEffect(() => {
    setLocalMin(minVal);
  }, [minVal]);
  React.useEffect(() => {
    setLocalMax(maxVal);
  }, [maxVal]);

  const handleRelease = React.useCallback(() => {
    setDraggingMin(false);
    setDraggingMax(false);
    onChange(localMin, localMax);
  }, [localMin, localMax, onChange]);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1 pt-6">
      {/* Track + Handles */}
      <div className="relative flex items-center h-5">
        {/* Base track */}
        <div className="absolute left-0 right-0 h-[3px] bg-gray-150 rounded-full pointer-events-none" />
        {/* Active gold range */}
        <div
          className="absolute h-[3px] bg-gradient-to-r from-[#C5A880] to-[#E5C8A0] rounded-full pointer-events-none"
          style={{
            left: `${pct(localMin)}%`,
            width: `${pct(localMax) - pct(localMin)}%`,
          }}
        />

        {/* Min input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onMouseDown={() => setDraggingMin(true)}
          onTouchStart={() => setDraggingMin(true)}
          onChange={(e) => {
            const v = Math.min(parseFloat(e.target.value), localMax - step);
            setLocalMin(v);
          }}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-[3px] appearance-none bg-transparent pointer-events-none z-20 outline-none
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#C5A880] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(197,168,128,0.4)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#C5A880] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab"
        />

        {/* Max input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onMouseDown={() => setDraggingMax(true)}
          onTouchStart={() => setDraggingMax(true)}
          onChange={(e) => {
            const v = Math.max(parseFloat(e.target.value), localMin + step);
            setLocalMax(v);
          }}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-[3px] appearance-none bg-transparent pointer-events-none z-20 outline-none
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#8B263E] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(139,38,62,0.3)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#8B263E] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab"
        />

        {/* Floating bubble Min */}
        <AnimatePresence>
          {draggingMin && (
            <motion.div
              key="bubble-min"
              initial={{ opacity: 0, scale: 0.7, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -28 }}
              exit={{ opacity: 0, scale: 0.7, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute pointer-events-none z-30 -translate-x-1/2"
              style={{ left: `${pct(localMin)}%` }}
            >
              <div className="bg-[#8B263E] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-lg whitespace-nowrap">
                {fmtBubble(localMin)}
                <div className="w-1.5 h-1.5 bg-[#8B263E] rotate-45 mx-auto -mb-1 mt-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating bubble Max */}
        <AnimatePresence>
          {draggingMax && (
            <motion.div
              key="bubble-max"
              initial={{ opacity: 0, scale: 0.7, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -28 }}
              exit={{ opacity: 0, scale: 0.7, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute pointer-events-none z-30 -translate-x-1/2"
              style={{ left: `${pct(localMax)}%` }}
            >
              <div className="bg-[#8B263E] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-lg whitespace-nowrap">
                {fmtBubble(localMax)}
                <div className="w-1.5 h-1.5 bg-[#8B263E] rotate-45 mx-auto -mb-1 mt-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Static value labels */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-bold text-[#C5A880]">{fmtBubble(localMin)}</span>
        <span className="text-[10px] font-bold text-[#8B263E]">{fmtBubble(localMax)}</span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ChipButton — reusable animated chip
// ─────────────────────────────────────────────────────────────────────────────

interface ChipButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const ChipButton = React.memo(function ChipButton({
  label,
  isSelected,
  onClick,
  className = "",
}: ChipButtonProps) {
  return (
    <motion.button
      type="button"
      variants={chipTapVariants}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap="tap"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all duration-220 cursor-pointer ${
        isSelected
          ? "bg-gradient-to-r from-[#C5A880] to-[#E5C8A0] text-white border-transparent shadow-[0_4px_10px_rgba(197,168,128,0.3)]"
          : "bg-white text-neutral-charcoal border-gray-200 hover:border-[#C5A880] hover:bg-[#FAF9F6]"
      } ${className}`}
    >
      {label}
    </motion.button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Venue Icon Card — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// Category Emoji helper (pure function, module-level)
// ─────────────────────────────────────────────────────────────────────────────

function getCategoryEmoji(slug: string): string {
  switch (slug) {
    case "photography": return "📷";
    case "decor":       return "🏰";
    case "makeup":      return "💄";
    case "mehendi":     return "🌿";
    case "catering":    return "🍽️";
    default:            return "✨";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Count matching vendors for preview badge (module-level)
// ─────────────────────────────────────────────────────────────────────────────

function countMatching(draft: FilterState): number {
  return mockVendors.filter((vendor) => {
    if (draft.category && vendor.category !== draft.category) return false;
    if (draft.city && vendor.city !== draft.city) return false;
    if (draft.budgetTier && vendor.tier !== draft.budgetTier) return false;
    if (draft.rating && vendor.rating < parseFloat(draft.rating)) return false;
    if (draft.experience && (vendor.experience || 0) < parseInt(draft.experience)) return false;
    if (draft.availability && vendor.availability !== "Available") return false;
    if (draft.isVerified && !vendor.isVerified) return false;
    if (draft.spaceType) {
      const t = draft.spaceType.toLowerCase();
      const isIndoor = ["indoor", "banquet", "banquet hall"].includes(t);
      const isOutdoor = ["outdoor", "garden", "rooftop", "beach", "palace"].includes(t);
      if (isIndoor && vendor.spaceType !== "Indoor" && vendor.spaceType !== "Both") return false;
      if (isOutdoor && vendor.spaceType !== "Outdoor" && vendor.spaceType !== "Both") return false;
    }
    if (draft.minPrice && vendor.priceStart < draft.minPrice) return false;
    if (draft.maxPrice && vendor.priceStart > draft.maxPrice) return false;
    return true;
  }).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarContent — module-level, memoized
// Receives only what it needs. Never re-renders from parent filter changes.
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarContentProps {
  draft: FilterState;
  onDraftChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onApply: () => void;
  onClearAll: () => void;
  cities: string[];
  budgetTiers: string[];
  matchingCount: number;
  openSections: Record<string, boolean>;
  onToggleSection: (key: string) => void;
}

const SidebarContent = React.memo(function SidebarContent({
  draft,
  onDraftChange,
  onApply,
  onClearAll,
  cities,
  budgetTiers,
  matchingCount,
  openSections,
  onToggleSection,
}: SidebarContentProps) {
  return (
    <motion.div
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="flex flex-col gap-2.5 pb-20 lg:pb-0"
    >
      {/* ── Header ── */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between pb-2 border-b border-gray-100 px-0.5"
      >
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#8B263E]" />
          <h3 className="font-serif text-sm font-bold text-neutral-charcoal">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 text-[9px] font-black uppercase text-neutral-muted hover:text-[#8B263E] transition-colors group/reset cursor-pointer"
        >
          <motion.div
            whileHover={{ rotate: -180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </motion.div>
          Clear All
        </button>
      </motion.div>

      {/* ── Category ── */}
      <FilterCard
        title="Category"
        isOpen={openSections.category}
        onToggle={() => onToggleSection("category")}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDraftChange("category", "")}
            className={`flex-shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl border text-[9px] font-bold transition-all duration-220 cursor-pointer ${
              draft.category === ""
                ? "bg-[#C5A880] text-white border-transparent shadow-[0_4px_10px_rgba(197,168,128,0.25)]"
                : "bg-white text-neutral-charcoal border-gray-200 hover:border-[#C5A880] hover:bg-[#FAF9F6]"
            }`}
          >
            📂 All
          </motion.button>
          {vendorCategories.map((cat) => {
            const isSel = draft.category === cat.slug;
            return (
              <motion.button
                key={cat.slug}
                type="button"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDraftChange("category", isSel ? "" : cat.slug)}
                className={`flex-shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl border text-[9px] font-bold transition-all duration-220 flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? "bg-[#C5A880] text-white border-transparent shadow-[0_4px_10px_rgba(197,168,128,0.25)]"
                    : "bg-white text-neutral-charcoal border-gray-200 hover:border-[#C5A880] hover:bg-[#FAF9F6]"
                }`}
              >
                <span>{getCategoryEmoji(cat.slug)}</span>
                <span>{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </FilterCard>

      {/* ── City ── */}
      <FilterCard
        title="City"
        isOpen={openSections.city}
        onToggle={() => onToggleSection("city")}
      >
        <SearchableCitySelect
          value={draft.city}
          onChange={(val) => onDraftChange("city", val)}
          options={cities}
          placeholder="All Cities"
        />
      </FilterCard>

      {/* ── Budget Segment ── */}
      <FilterCard
        title="Budget Segment"
        isOpen={openSections.budgetTier}
        onToggle={() => onToggleSection("budgetTier")}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {budgetTiers.map((tier) => {
            const isSel = draft.budgetTier === tier;
            return (
              <motion.button
                key={tier}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                animate={
                  isSel
                    ? { boxShadow: "0 0 12px rgba(197,168,128,0.28)" }
                    : { boxShadow: "none" }
                }
                onClick={() => onDraftChange("budgetTier", isSel ? "" : tier)}
                className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all duration-220 cursor-pointer ${
                  isSel
                    ? "bg-gradient-to-r from-[#C5A880] to-[#E5C8A0] text-white border-transparent"
                    : "bg-white text-neutral-charcoal border-gray-200 hover:border-[#C5A880] hover:bg-[#FAF9F6]"
                }`}
              >
                {tier}
              </motion.button>
            );
          })}
        </div>
      </FilterCard>

      {/* ── Price Range (NEVER updates parent while dragging) ── */}
      <div className="hidden md:block">
        <FilterCard
          title="Price Range"
          isOpen={openSections.priceRange}
          onToggle={() => onToggleSection("priceRange")}
        >
          <DoubleRangeSlider
            min={0.5}
            max={10.0}
            step={0.5}
            minVal={draft.minPrice}
            maxVal={draft.maxPrice}
            onChange={(minV, maxV) => {
              onDraftChange("minPrice", minV);
              onDraftChange("maxPrice", maxV);
            }}
          />
        </FilterCard>
      </div>

      {/* ── Rating ── */}
      <FilterCard
        title="Minimum Rating"
        isOpen={openSections.rating}
        onToggle={() => onToggleSection("rating")}
      >
        <StarRatingSelector
          value={draft.rating}
          onChange={(val) => onDraftChange("rating", val)}
        />
      </FilterCard>



    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Apply Filters Button — module-level, memoized
// ─────────────────────────────────────────────────────────────────────────────

interface ApplyButtonProps {
  count: number;
  onClick: () => void;
}

const ApplyButton = React.memo(function ApplyButton({ count, onClick }: ApplyButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-3 border-t border-gray-100 bg-white/90 backdrop-blur-md sticky bottom-0 left-0 right-0 z-20 pb-1"
    >
      <motion.button
        type="button"
        whileHover={{
          scale: 1.02,
          y: -4,
          boxShadow: "0 10px 28px rgba(139,38,62,0.28)",
        }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        onClick={onClick}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B263E] to-[#A33B54] text-white text-[11px] font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>Apply Filters</span>
        <motion.span
          key={count}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-black"
        >
          {count}
        </motion.span>
      </motion.button>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// VendorFilters — Main Export
// All state mutations are LOCAL (draft). Parent only updates on Apply.
// ─────────────────────────────────────────────────────────────────────────────

const CITIES = ["Hyderabad", "Goa", "Jaipur", "Udaipur", "Mumbai", "Delhi", "Kerala"];
const BUDGET_TIERS = ["Luxury", "Premium", "Budget"];

const INITIAL_SECTIONS: Record<string, boolean> = {
  category: true,
  city: true,
  budgetTier: true,
  priceRange: true,
  rating: false,
};

export const VendorFilters = React.memo(function VendorFilters({
  filters,
  setFilters,
  onClearFilters,
  isOpen,
  onClose,
}: VendorFiltersProps) {
  // ── LOCAL DRAFT STATE — never bubbles up until "Apply" ──
  const [draft, setDraft] = React.useState<FilterState>(filters);

  // Sync draft when parent resets (e.g. Clear All from toolbar)
  React.useEffect(() => {
    setDraft(filters);
  }, [filters]);

  // Stable draft updater — never recreated
  const onDraftChange = React.useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Apply → commit draft to parent → trigger vendor grid update
  const handleApply = React.useCallback(() => {
    setFilters(draft);
    onClose();
  }, [draft, setFilters, onClose]);

  // Clear All → reset both draft and parent
  const handleClearAll = React.useCallback(() => {
    onClearFilters();
    onClose();
  }, [onClearFilters, onClose]);

  // Accordion open/close state — purely local, never triggers parent re-render
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    INITIAL_SECTIONS
  );

  const onToggleSection = React.useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Count preview (computed from draft, not parent filters)
  const matchingCount = React.useMemo(() => countMatching(draft), [draft]);

  return (
    <>
      {/* ── Desktop Sticky Sidebar ── */}
      <div className="hidden lg:block w-64 shrink-0 self-start sticky top-24 relative z-10">
        {/* Ambient glows */}
        <div className="absolute -left-8 -top-8 w-48 h-48 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#8B263E]/8 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/82 backdrop-blur-md border border-[#C5A880]/20 shadow-[0_12px_40px_rgba(197,168,128,0.07)] rounded-[20px] p-4 cursor-default flex flex-col gap-3"
        >
          <SidebarContent
            draft={draft}
            onDraftChange={onDraftChange}
            onApply={handleApply}
            onClearAll={handleClearAll}
            cities={CITIES}
            budgetTiers={BUDGET_TIERS}
            matchingCount={matchingCount}
            openSections={openSections}
            onToggleSection={onToggleSection}
          />

          <ApplyButton count={matchingCount} onClick={handleApply} />
        </motion.div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] md:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed left-0 right-0 bottom-0 h-[85vh] bg-white z-[130] shadow-[0_-8px_40px_rgba(0,0,0,0.16)] rounded-t-3xl md:hidden flex flex-col overflow-hidden"
            >
              {/* 1. HEADER (Fixed) */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0 z-10">
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold text-neutral-charcoal">Filters</span>
                  {matchingCount > 0 && (
                    <span className="text-[10px] text-neutral-muted uppercase font-bold tracking-wider">{matchingCount} Results</span>
                  )}
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  onClick={onClose}
                  className="p-2 -mr-2 bg-gray-50 rounded-full text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* 2. SCROLLABLE FILTER CONTENT */}
              <div className="flex-grow overflow-y-auto px-6 pt-4 pb-20">
                <SidebarContent
                  draft={draft}
                  onDraftChange={onDraftChange}
                  onApply={handleApply}
                  onClearAll={handleClearAll}
                  cities={CITIES}
                  budgetTiers={BUDGET_TIERS}
                  matchingCount={matchingCount}
                  openSections={openSections}
                  onToggleSection={onToggleSection}
                />
              </div>

              {/* 3. FIXED ACTION FOOTER */}
              <div className="shrink-0 p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex gap-3 z-10 safe-area-bottom">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClearAll}
                  className="flex-[0.4] py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-neutral-charcoal bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Clear All
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, boxShadow: "0 6px 18px rgba(139,38,62,0.28)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  onClick={handleApply}
                  className="flex-[0.6] py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#8B263E] to-[#A33B54] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Show {matchingCount} Results</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
