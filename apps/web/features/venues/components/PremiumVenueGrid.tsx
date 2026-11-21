"use client";

import React from "react";
import { Venue } from "@/mock-data/venues";
import { typography, spacing } from "@/styles";
import VenueCard from "@/components/cards/VenueCard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, Search } from "lucide-react";

interface PremiumVenueGridProps {
  venues: Venue[];
  totalCount: number;
  activeFilterCount: number;
  onReset: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortBy?: "relevance" | "rating" | "reviews" | "capacity" | "newest";
  onSortChange?: (sortBy: "relevance" | "rating" | "reviews" | "capacity" | "newest") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function PremiumVenueGrid({
  venues,
  totalCount,
  activeFilterCount,
  onReset,
  isLoading = false,
  error = null,
  onRetry,
  page = 1,
  totalPages = 1,
  onPageChange,
  sortBy = "relevance",
  onSortChange,
  searchQuery = "",
  onSearchChange,
}: PremiumVenueGridProps) {
  return (
    <section id="venue-grid" className={`${spacing.section} max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E8D8BC]/30 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A165] block">
              Venue Directory
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] font-bold text-neutral-500">
              {totalCount > 0 && venues.length > 0
                ? `Showing ${(page - 1) * 20 + 1}–${(page - 1) * 20 + venues.length} of ${totalCount.toLocaleString("en-IN")} Luxury Spaces`
                : `Showing ${venues.length} of ${totalCount.toLocaleString("en-IN")} Luxury Spaces`}
            </span>
          </div>
          <h2 className={`${typography.sectionTitle} text-neutral-900`}>
            Explore Luxury Venues
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {onSearchChange && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                aria-label="Search venues"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search venue or area..."
                className="pl-9 pr-3.5 py-2 rounded-full text-xs font-medium text-neutral-700 bg-white border border-[#C5A880]/30 focus:outline-none focus:border-[#C5A880] w-48 sm:w-56"
              />
            </div>
          )}

          {onSortChange && (
            <select
              aria-label="Sort venues"
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as "relevance" | "rating" | "reviews" | "capacity" | "newest"
                )
              }
              className="px-3.5 py-2 rounded-full text-xs font-bold text-neutral-700 bg-white border border-[#C5A880]/30 focus:outline-none"
            >
              <option value="relevance">Sort: Recommended</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="reviews">Sort: Most Reviewed</option>
              <option value="capacity">Sort: Largest Capacity</option>
              <option value="newest">Sort: Newest</option>
            </select>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#8B263E] bg-[#FAF5ED] border border-[#C5A880]/30 hover:bg-[#F3ECE0] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {activeFilterCount} Filter{activeFilterCount > 1 ? "s" : ""}</span>
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="py-14 px-6 text-center bg-white rounded-3xl border border-red-200 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
          <h3 className="font-serif text-xl font-bold text-neutral-900 mb-1">
            Unable to load venues
          </h3>
          <p className="text-xs text-neutral-600 mb-5">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#6e1c2f]"
            >
              Retry
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[360px] rounded-2xl bg-white border border-[#E5E0D8] p-4 animate-pulse space-y-3"
            >
              <div className="h-48 bg-neutral-100 rounded-xl w-full" />
              <div className="h-4 bg-neutral-100 rounded w-3/4" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
              <div className="h-3 bg-neutral-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="py-20 px-4 text-center bg-white rounded-3xl border border-[#C5A880]/20 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#FAF5ED] border border-[#C5A880]/30 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-[#C5A880]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
            No matching venues found
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md">
            We couldn&apos;t find venues matching your selected filters. Try broadening your location, capacity, or budget criteria.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all shadow-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Grid: 4 Desktop, 2 Tablet, 1 Mobile */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12"
        >
          <AnimatePresence>
            {venues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
              >
                <VenueCard venue={venue} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && !error && totalPages > 1 && onPageChange && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#C5A880]/40 text-neutral-700 disabled:opacity-40 hover:bg-[#FAF5ED]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-bold text-neutral-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#C5A880]/40 text-neutral-700 disabled:opacity-40 hover:bg-[#FAF5ED]"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
