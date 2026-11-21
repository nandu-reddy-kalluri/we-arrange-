"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Star,
  ArrowLeft,
  Clock,
  ExternalLink,
  Calendar,
  Video,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_VENUE_IMAGE,
  fetchVenueDetail,
  type VenueDetailResult,
} from "@/services/catalog/catalogApi";
import { CatalogEnquiryModal } from "@/components/shared/CatalogEnquiryModal";
import { EntityReviewsSection } from "@/components/shared/EntityReviewsSection";
import { WeddingCuratorCard } from "@/features/vendors/components/WeddingCuratorCard";
import { PlanningJourney } from "@/features/vendors/components/PlanningJourney";
import { DynamicGridGallery } from "@/components/ui/DynamicGridGallery";
import { useSavedStore } from "@/store/useSavedStore";

function isDisplayablePrice(value: unknown): value is number {
  const num = Number(value);
  return Number.isFinite(num) && num > 1;
}

function formatCurrency(amount: number, currency?: string | null): string {
  const code = (currency || "INR").toUpperCase();
  if (code !== "INR") {
    return `${code} ${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(raw?: string | null): string {
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-150 py-3.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-xs font-bold text-neutral-charcoal hover:text-[#8B263E] transition-colors focus:outline-none cursor-pointer"
      >
        <span>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2 text-[11px] text-neutral-muted leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function VenueDetailSkeleton() {
  return (
    <main className="min-h-screen bg-neutral-cream pb-16 text-neutral-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 lg:pt-28 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-6" />
        <div className="h-[300px] md:h-[450px] w-full bg-gray-200 rounded-[22px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-9 w-2/3 bg-gray-200 rounded" />
            <div className="h-24 w-full bg-gray-200 rounded-2xl" />
            <div className="h-44 w-full bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-gray-200 rounded-[22px]" />
        </div>
      </div>
    </main>
  );
}

export default function VenueDetailsClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { isVenueSaved, toggleSaveVenue } = useSavedStore();

  const [detail, setDetail] = useState<VenueDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  const [enquiryModal, setEnquiryModal] = useState<{
    open: boolean;
    subject?: string;
    message?: string;
  }>({ open: false });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setNotFound(false);
    setError(null);

    void fetchVenueDetail(slug)
      .then((res) => {
        if (!active) return;
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          } else {
            setError(res.error || "Unable to load venue details.");
          }
          setDetail(null);
          setIsLoading(false);
          return;
        }
        setDetail(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load venue details.");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, reloadTick]);

  const venue = detail?.venue;
  const numericVenueId =
    venue && /^\d+$/.test(venue.id) ? Number(venue.id) : undefined;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const isWishlisted = isMounted && venue ? isVenueSaved(venue.id) : false;

  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const allGalleryImages = useMemo(() => {
    return detail?.galleryUrls ?? [];
  }, [detail]);

  const lightboxImages = useMemo(() => {
    if (allGalleryImages.length > 0) return allGalleryImages;
    if (venue?.imageUrl) return [venue.imageUrl];
    return [DEFAULT_VENUE_IMAGE];
  }, [allGalleryImages, venue?.imageUrl]);

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const handleNextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveLightboxIndex((prev) => {
        if (prev === null || prev >= lightboxImages.length - 1) return prev;
        return prev + 1;
      });
    },
    [lightboxImages.length]
  );

  const isFirstImage = activeLightboxIndex === 0;
  const isLastImage =
    activeLightboxIndex !== null && activeLightboxIndex === lightboxImages.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setActiveLightboxIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, handlePrevImage, handleNextImage]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartRef.current === null) return;
    const deltaX = e.clientX - mouseStartRef.current;
    mouseStartRef.current = null;

    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeoutRef.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 25) {
      if (delta > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 350);
    }
  };

  const validFaqs = useMemo(
    () =>
      (detail?.faqs ?? []).filter(
        (f): f is typeof f & { question: string; answer: string } =>
          Boolean(f.question && f.question.trim() && f.answer && f.answer.trim())
      ),
    [detail?.faqs]
  );

  const hasPricingSection = useMemo(() => {
    if (!detail) return false;
    const hasPriceRows = detail.pricing.some(
      (p) =>
        isDisplayablePrice(p.starting_price) ||
        isDisplayablePrice(p.rental_cost) ||
        isDisplayablePrice(p.veg_price) ||
        isDisplayablePrice(p.non_veg_price) ||
        Boolean(p.price_tag && p.price_tag.trim())
    );
    return hasPriceRows || detail.packages.length > 0 || detail.menus.length > 0;
  }, [detail]);

  const subNavTabs = useMemo(() => {
    if (!detail) return [];
    const tabs: Array<{ label: string; id: string }> = [
      { label: "Overview", id: "overview" },
    ];
    if (hasPricingSection) {
      tabs.push({ label: "Pricing & Packages", id: "pricing" });
    }
    if (allGalleryImages.length > 0 || detail.videos.length > 0) {
      tabs.push({ label: "Gallery", id: "portfolio" });
    }
    if (detail.amenities.length > 0) {
      tabs.push({ label: "Amenities", id: "amenities" });
    }
    tabs.push({ label: "Policies", id: "policies" });
    tabs.push({ label: "Reviews", id: "reviews" });
    if (validFaqs.length > 0) {
      tabs.push({ label: "FAQ", id: "faq" });
    }
    tabs.push({ label: "Contact", id: "contact" });
    return tabs;
  }, [detail, hasPricingSection, allGalleryImages.length, validFaqs.length]);

  useEffect(() => {
    if (subNavTabs.length === 0) return;
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const tab of subNavTabs) {
        const element = document.getElementById(tab.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + height) {
            setActiveTab(tab.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [subNavTabs]);

  if (isLoading) {
    return <VenueDetailSkeleton />;
  }

  if (notFound || (!error && !detail)) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">
          Venue Not Found
        </h2>
        <p className="text-xs text-neutral-muted max-w-md">
          The venue matching &quot;{slug}&quot; could not be found or is no longer active.
        </p>
        <Link
          href="/venues"
          className="px-6 py-2.5 rounded-full bg-[#8B263E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all"
        >
          Explore Venues
        </Link>
      </div>
    );
  }

  if (error || !detail || !venue) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-8 h-8 text-[#8B263E]" />
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">
          Unable to Load Venue
        </h2>
        <p className="text-xs text-neutral-muted max-w-md">
          {error || "Something went wrong while fetching venue details."}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReloadTick((t) => t + 1)}
            className="px-5 py-2.5 rounded-full bg-[#8B263E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
          <Link
            href="/venues"
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-neutral-charcoal font-bold text-xs uppercase tracking-wider hover:border-[#C5A880] transition-all"
          >
            Explore Venues
          </Link>
        </div>
      </div>
    );
  }

  const { rawVenue } = detail;
  const heroImages = allGalleryImages.length > 0 ? allGalleryImages : [DEFAULT_VENUE_IMAGE];
  const aboutText = rawVenue.aboutVenue || rawVenue.description || rawVenue.shortSummary;

  const parkingRecord = detail.parking[0];
  const parkingSummary = parkingRecord
    ? parkingRecord.available === false
      ? "Not Available"
      : parkingRecord.parking_details
        ? "Available"
        : "Valet / Available"
    : "On Enquiry";

  const roomsSummary =
    venue.rooms > 0
      ? `${venue.rooms} Rooms`
      : detail.rooms[0]?.room_description
        ? "Available"
        : "On Enquiry";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
      setActiveTab(id);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-cream pb-24 lg:pb-16 text-neutral-charcoal relative">
      {/* Complete Venue Gallery Lightbox Modal via portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeLightboxIndex !== null && lightboxImages[activeLightboxIndex] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveLightboxIndex(null)}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 pb-6 md:pb-8 select-none overflow-hidden"
              >
            <div
              className="flex items-center justify-between text-white z-10 mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-md">
                  {venue.name}
                </span>
                <span className="text-[10px] md:text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-white/90">
                  {activeLightboxIndex + 1} / {lightboxImages.length}
                </span>
              </div>

              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div
              className="relative flex-1 my-auto w-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden min-h-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onClick={(e) => e.stopPropagation()}
            >
              {!isFirstImage && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/60 hover:bg-[#8B263E] text-white rounded-full backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}

              <motion.div
                key={activeLightboxIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-5xl max-h-[55vh] md:max-h-[62vh] w-full h-full flex items-center justify-center pointer-events-none"
              >
                <img
                  src={lightboxImages[activeLightboxIndex] || DEFAULT_VENUE_IMAGE}
                  alt={`${venue.name} photo ${activeLightboxIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_VENUE_IMAGE;
                  }}
                />
              </motion.div>

              {!isLastImage && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/60 hover:bg-[#8B263E] text-white rounded-full backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
            </div>

            {lightboxImages.length > 1 && (
              <div
                className="w-full max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto py-2 px-4 hide-scrollbar z-10 justify-start sm:justify-center mt-2 mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {lightboxImages.map((thumbUrl, idx) => (
                  <button
                    key={`${thumbUrl}-${idx}`}
                    onClick={() => setActiveLightboxIndex(idx)}
                    className={`relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeLightboxIndex
                        ? "border-[#C5A880] scale-105 shadow-md opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_VENUE_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
          </AnimatePresence>,
          document.body
        )}

      {/* Header Container & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 lg:pt-28">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-muted hover:text-[#8B263E] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to directory</span>
            </button>
            <nav
              aria-label="Breadcrumb"
              className="hidden sm:flex items-center gap-2 text-xs text-neutral-muted"
            >
              <span>/</span>
              <Link href="/" className="hover:text-[#8B263E] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/venues" className="hover:text-[#8B263E] transition-colors">
                Venues
              </Link>
              <span>/</span>
              <span>{venue.city}</span>
              <span>/</span>
              <span className="font-semibold text-neutral-charcoal truncate max-w-[240px]">
                {venue.name}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#C5A880] text-gray-500 hover:text-neutral-charcoal transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
              title="Share Page"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && <span className="pr-1 text-[#8B263E]">Copied</span>}
            </button>
            <button
              onClick={() => toggleSaveVenue(venue.id)}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#8B263E] text-gray-500 hover:text-[#8B263E] transition-colors cursor-pointer"
              title={isWishlisted ? "Remove from Saved" : "Save Venue"}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Dynamic Expandable Grid Gallery */}
        <DynamicGridGallery
          items={heroImages}
          fallbackSrc={DEFAULT_VENUE_IMAGE}
          gap={12}
          expandFactor={1.85}
          rounded="rounded-[22px]"
          itemRounded="rounded-xl"
          aspectRatioClass="h-[300px] sm:h-[380px] md:h-[450px]"
          totalCount={allGalleryImages.length}
          showViewAllButton={allGalleryImages.length > 0}
          onItemClick={(_item, index) => setActiveLightboxIndex(index)}
          onViewAllClick={() => setActiveLightboxIndex(0)}
        />
      </div>

      {/* Sticky Sub-Navigation */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-150 z-30 shadow-sm mt-8 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto scrollbar-none py-2.5">
          {subNavTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#C5A880] text-[#8B263E] font-black"
                  : "border-transparent text-neutral-muted hover:text-neutral-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Details and Sticky Booking Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Header / Info Block */}
            <div id="overview" className="scroll-mt-32">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#8B263E] px-3 py-1 rounded-full shadow-sm">
                  {detail.typeName || venue.type} • {rawVenue.indoorOutdoorSpaces || venue.space}
                </span>
                {venue.isVerified && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-[#8B263E] to-[#C5A880] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                    Verified Venue
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2D2D2D] leading-tight mb-3">
                {venue.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-muted">
                {rawVenue.hasExplicitRating && (
                  <>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(venue.rating)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-neutral-charcoal pl-1">
                        {venue.rating.toFixed(1)}
                      </span>
                      {rawVenue.reviewsCount > 0 && (
                        <span>({rawVenue.reviewsCount} Reviews)</span>
                      )}
                    </div>
                    <span>•</span>
                  </>
                )}

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>
                    {venue.location && venue.location !== venue.city
                      ? `${venue.location}, ${venue.city}`
                      : venue.city}
                  </span>
                </div>
              </div>

              {rawVenue.address && (
                <p className="text-xs text-neutral-muted mt-3 leading-relaxed">
                  {rawVenue.address}
                  {rawVenue.pincode ? ` - ${rawVenue.pincode}` : ""}
                </p>
              )}

              {(rawVenue.availabilityStartTime ||
                rawVenue.website ||
                rawVenue.googleMaps) && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {rawVenue.availabilityStartTime && rawVenue.availabilityEndTime && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-muted bg-white border border-gray-200 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                      {rawVenue.availabilityStartTime} - {rawVenue.availabilityEndTime}
                    </span>
                  )}
                  {rawVenue.googleMaps && (
                    <a
                      href={rawVenue.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B263E] hover:underline"
                    >
                      View on Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {rawVenue.website && (
                    <a
                      href={rawVenue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B263E] hover:underline"
                    >
                      Venue Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[18px] bg-white border border-[#C5A880]/15 shadow-sm">
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Capacity
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {venue.capacityRange || `${venue.maxCapacity} Pax`}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Rooms
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {roomsSummary}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Parking
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {parkingSummary}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Space Type
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {rawVenue.indoorOutdoorSpaces || venue.space}
                </span>
              </div>
            </div>

            {/* About Venue */}
            {aboutText && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">
                  About the Venue
                </h3>
                <p className="text-xs text-neutral-muted leading-relaxed whitespace-pre-line">
                  {aboutText}
                </p>
              </div>
            )}

            {/* Venue Highlights / Features (Only when real DB highlights/features exist) */}
            {venue.venueHighlights.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                  Venue Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {venue.venueHighlights.map((highlight, i) => (
                    <div
                      key={`${highlight}-${i}`}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 bg-white hover:border-[#C5A880]/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C5A880] text-xs font-bold font-serif shadow-sm shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-neutral-charcoal block leading-tight">
                          {highlight.replace("✔ ", "")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms & Accommodation */}
            {detail.rooms.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                  Rooms &amp; Accommodation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {detail.rooms.map((room) => (
                    <div
                      key={room.room_id}
                      className="p-4 rounded-xl border border-gray-150 bg-white"
                    >
                      {room.number_of_rooms !== null && room.number_of_rooms > 0 && (
                        <span className="text-sm font-black text-[#8B263E] block mb-1">
                          {room.number_of_rooms} Guest Rooms
                        </span>
                      )}
                      {room.room_description && (
                        <p className="text-xs text-neutral-muted leading-relaxed">
                          {room.room_description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing, Packages & Catering Menus */}
            {hasPricingSection && (
              <div id="pricing" className="border-b border-gray-100 pb-6 scroll-mt-24 space-y-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal">
                  Pricing, Packages &amp; Dining
                </h3>

                {detail.pricing.map((p) => (
                  <div
                    key={p.pricing_id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
                  >
                    {isDisplayablePrice(p.starting_price) && (
                      <div className="p-4 rounded-xl border border-gray-150 bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted block">
                          Starting Package
                        </span>
                        <span className="text-base font-black text-[#8B263E]">
                          {formatCurrency(p.starting_price, p.currency)}
                        </span>
                      </div>
                    )}
                    {isDisplayablePrice(p.rental_cost) && (
                      <div className="p-4 rounded-xl border border-gray-150 bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted block">
                          Venue Rental
                        </span>
                        <span className="text-base font-black text-[#8B263E]">
                          {formatCurrency(p.rental_cost, p.currency)}
                        </span>
                      </div>
                    )}
                    {isDisplayablePrice(p.veg_price) && (
                      <div className="p-4 rounded-xl border border-gray-150 bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted block">
                          Veg Plate
                        </span>
                        <span className="text-base font-black text-[#8B263E]">
                          {formatCurrency(p.veg_price, p.currency)}
                        </span>
                      </div>
                    )}
                    {isDisplayablePrice(p.non_veg_price) && (
                      <div className="p-4 rounded-xl border border-gray-150 bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted block">
                          Non-Veg Plate
                        </span>
                        <span className="text-base font-black text-[#8B263E]">
                          {formatCurrency(p.non_veg_price, p.currency)}
                        </span>
                      </div>
                    )}
                    {p.price_subtext && (
                      <div className="sm:col-span-3 text-xs text-neutral-muted">
                        {p.price_subtext}
                      </div>
                    )}
                  </div>
                ))}

                {detail.packages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detail.packages.map((pkg) => (
                      <div
                        key={pkg.package_id}
                        className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A880] transition-colors shadow-sm"
                      >
                        <div>
                          <h4 className="font-serif text-base font-bold text-[#2D2D2D] mb-1">
                            {pkg.package_name}
                          </h4>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-base font-black text-[#8B263E]">
                              {isDisplayablePrice(pkg.price)
                                ? formatCurrency(pkg.price, rawVenue.currency)
                                : "Price on Request"}
                            </span>
                            {pkg.capacity && pkg.capacity > 0 && (
                              <span className="text-[11px] font-semibold text-neutral-muted">
                                • Up to {pkg.capacity} guests
                              </span>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-[11px] text-neutral-muted leading-relaxed border-t border-gray-50 pt-3">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setEnquiryModal({
                              open: true,
                              subject: `${pkg.package_name} Enquiry: ${venue.name}`,
                              message: `Hi Concierge, we would like to enquire about "${pkg.package_name}" at ${venue.name}.`,
                            })
                          }
                          className="w-full py-2.5 rounded-xl border border-[#C5A880] text-[#8B263E] hover:bg-[#8B263E] hover:text-white hover:border-[#8B263E] text-[10px] font-bold uppercase tracking-wider mt-5 transition-all cursor-pointer"
                        >
                          Enquire Package
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {detail.menus.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {detail.menus.map((menu) => (
                      <div
                        key={menu.menu_id}
                        className="p-4 rounded-xl border border-gray-150 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-charcoal">
                            {menu.menu_name || "Wedding Dining Menu"}
                          </span>
                          {menu.menu_url && (
                            <a
                              href={menu.menu_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#8B263E] hover:underline flex items-center gap-1"
                            >
                              View Menu
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {menu.cuisines && (
                          <p className="text-[11px] text-neutral-muted">
                            Cuisines: {menu.cuisines}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-neutral-charcoal">
                          {isDisplayablePrice(menu.veg_price) && (
                            <span>Veg: {formatCurrency(menu.veg_price, rawVenue.currency)}</span>
                          )}
                          {isDisplayablePrice(menu.non_veg_price) && (
                            <span>
                              Non-Veg: {formatCurrency(menu.non_veg_price, rawVenue.currency)}
                            </span>
                          )}
                        </div>
                        {menu.alcohol_policy && (
                          <p className="text-[10px] text-neutral-muted">
                            Alcohol Policy: {menu.alcohol_policy}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Complete Venue Gallery & Videos (Only when real media exists) */}
            {(allGalleryImages.length > 0 || detail.videos.length > 0) && (
              <div id="portfolio" className="border-b border-gray-100 pb-6 scroll-mt-24 space-y-6">
                {allGalleryImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-bold text-neutral-charcoal">
                        Complete Venue Gallery
                      </h3>
                      <button
                        onClick={() => setActiveLightboxIndex(0)}
                        className="text-xs font-bold uppercase tracking-wider text-[#8B263E] hover:text-[#C5A880] transition-colors cursor-pointer"
                      >
                        View Fullscreen ({allGalleryImages.length} photos) →
                      </button>
                    </div>
                    <div className="columns-2 sm:columns-3 gap-3">
                      {allGalleryImages.map((imgUrl, i) => (
                        <div
                          key={`${imgUrl}-${i}`}
                          className="mb-3 break-inside-avoid relative overflow-hidden rounded-xl bg-gray-100 group shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`${venue.name} gallery item ${i + 1}`}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_VENUE_IMAGE;
                            }}
                            className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                            onClick={() => setActiveLightboxIndex(i)}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                              Expand image
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.videos.length > 0 && (
                  <div>
                    <h4 className="font-serif text-base font-bold text-neutral-charcoal mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#C5A880]" />
                      Venue Walkthrough Videos
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detail.videos.map((video) => (
                        <a
                          key={video.video_id}
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl border border-gray-150 bg-white hover:border-[#C5A880] transition-colors flex items-center justify-between gap-3"
                        >
                          <span className="text-xs font-bold text-neutral-charcoal truncate">
                            {video.title || "Watch Venue Video"}
                          </span>
                          <ExternalLink className="w-4 h-4 text-[#8B263E] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amenities & Policies */}
            <div
              id="amenities"
              className="border-b border-gray-100 pb-6 scroll-mt-24 flex flex-col md:flex-row gap-8"
            >
              {detail.amenities.length > 0 && (
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                    Amenities
                  </h3>
                  <ul className="text-xs text-neutral-muted leading-relaxed flex flex-col gap-3">
                    {detail.amenities.map((amenity) => (
                      <li key={amenity.amenity_id} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#C5A880]" />
                        <span className="font-semibold">{amenity.amenity_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div id="policies" className="flex-1 scroll-mt-24">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                  Policies &amp; Operations
                </h3>
                <ul className="text-xs text-neutral-muted leading-relaxed flex flex-col gap-3">
                  <li className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
                    <span className="font-semibold">Catering Policy</span>
                    <span className="font-bold text-neutral-charcoal text-right">
                      {rawVenue.cateringPolicy ||
                        (venue.policies.outsideCatering
                          ? "Outside Catering Allowed"
                          : "In-House Only")}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
                    <span className="font-semibold">Decor Policy</span>
                    <span className="font-bold text-neutral-charcoal text-right">
                      {rawVenue.decorPolicy ||
                        (venue.policies.outsideDecor
                          ? "Outside Decorators Allowed"
                          : "Panel Decorators Only")}
                    </span>
                  </li>
                  {parkingRecord?.parking_details && (
                    <li className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
                      <span className="font-semibold">Parking Details</span>
                      <span className="font-bold text-neutral-charcoal text-right">
                        {parkingRecord.parking_details}
                      </span>
                    </li>
                  )}
                  {detail.menus.some((m) => m.alcohol_policy) && (
                    <li className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
                      <span className="font-semibold">Alcohol Policy</span>
                      <span className="font-bold text-neutral-charcoal text-right">
                        {detail.menus.find((m) => m.alcohol_policy)?.alcohol_policy}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Availability Schedule (Only when DB rows exist) */}
            {detail.availability.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A880]" />
                  Availability Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.availability.map((slot) => (
                    <div
                      key={slot.availability_id}
                      className="p-3 rounded-xl border border-gray-150 bg-white flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-neutral-charcoal">
                        {formatShortDate(slot.available_from)}
                        {slot.available_to
                          ? ` - ${formatShortDate(slot.available_to)}`
                          : ""}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          slot.is_booked
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {slot.is_booked ? "Booked" : "Available"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div id="reviews" className="scroll-mt-24">
              <EntityReviewsSection venueId={numericVenueId} entityName={venue.name} />
            </div>

            {/* FAQ Accordion (Only when DB FAQs exist) */}
            {validFaqs.length > 0 && (
              <div id="faq" className="pb-6 scroll-mt-24">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="flex flex-col">
                  {validFaqs.map((faq) => (
                    <FaqItem
                      key={faq.faq_id}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div id="contact" className="lg:col-span-1 scroll-mt-24">
            <div className="lg:sticky lg:top-24 bg-white border border-[#C5A880]/20 rounded-[22px] p-6 shadow-[0_12px_40px_rgba(197,168,128,0.06)] flex flex-col">
              {venue.priceOnwards && venue.priceOnwards !== "Price on Request" && (
                <div className="mb-5 pb-4 border-b border-gray-100">
                  <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest">
                    Starting Estimate
                  </span>
                  <span className="text-xl font-black text-[#8B263E]">
                    {venue.priceOnwards}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <button
                  onClick={() => toggleSaveVenue(venue.id)}
                  className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${
                    isWishlisted
                      ? "bg-[#8B263E] text-white border border-[#8B263E] shadow-[0_4px_16px_rgba(139,38,62,0.25)]"
                      : "bg-[#FAF9F6] text-neutral-charcoal border border-[#C5A880]/40 hover:border-[#8B263E] hover:text-[#8B263E]"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${isWishlisted ? "text-white fill-white" : "text-[#8B263E]"}`}
                  />
                  <span>{isWishlisted ? "Saved to Shortlist" : "Save to Shortlist"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={() =>
                    setEnquiryModal({
                      open: true,
                      subject: `Custom Quote Request: ${venue.name}`,
                      message: `Hi Concierge, we would like a custom wedding quote and date availability for ${venue.name}.`,
                    })
                  }
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all cursor-pointer shadow-md text-center"
                >
                  Get Custom Quote
                </button>
                <button
                  onClick={() =>
                    setEnquiryModal({
                      open: true,
                      subject: `Site Visit Request: ${venue.name}`,
                      message: `Hi Concierge, please schedule a guided site visit for ${venue.name}.`,
                    })
                  }
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-[#8B263E] border border-[#8B263E] hover:bg-[#8B263E]/5 transition-all cursor-pointer text-center"
                >
                  Schedule Site Visit
                </button>

                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={() => toggleSaveVenue(venue.id)}
                    className="flex-1 py-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-neutral-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`}
                    />
                    {isWishlisted ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-neutral-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copiedShare ? "Copied" : "Share"}
                  </button>
                </div>
              </div>

              <WeddingCuratorCard />
              <PlanningJourney />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Consultation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex-1">
          <button
            onClick={() => toggleSaveVenue(venue.id)}
            className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[11px] uppercase tracking-wider transition-all border ${
              isWishlisted
                ? "bg-[#8B263E] text-white border-[#8B263E]"
                : "bg-[#FAF9F6] text-neutral-charcoal border-[#C5A880]/30 hover:border-[#8B263E]"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "text-white fill-white" : "text-[#8B263E]"}`}
            />
            <span>{isWishlisted ? "Saved" : "Save"}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setEnquiryModal({
                open: true,
                subject: `Site Visit Request: ${venue.name}`,
                message: `Hi Concierge, please schedule a guided site visit for ${venue.name}.`,
              })
            }
            className="px-3.5 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer"
          >
            Visit
          </button>
          <button
            onClick={() =>
              setEnquiryModal({
                open: true,
                subject: `Custom Quote Request: ${venue.name}`,
                message: `Hi Concierge, please share a custom wedding quote for ${venue.name}.`,
              })
            }
            className="px-4 py-3 rounded-xl bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[11px] font-bold uppercase tracking-wider shadow-md text-center transition-colors cursor-pointer"
          >
            Get Quote
          </button>
        </div>
      </div>

      <CatalogEnquiryModal
        isOpen={enquiryModal.open}
        onClose={() => setEnquiryModal({ open: false })}
        targetName={venue.name}
        targetCity={venue.city}
        venueId={numericVenueId}
        defaultSubject={enquiryModal.subject}
        defaultMessage={enquiryModal.message}
      />
    </main>
  );
}
