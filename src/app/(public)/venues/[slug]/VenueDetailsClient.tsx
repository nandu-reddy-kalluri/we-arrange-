"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, MapPin, CheckCircle, ChevronLeft, ChevronRight, Share2, 
  Star, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { featuredVenues } from "@/mock-data/venues";
import { WeddingCuratorCard } from "@/features/vendors/components/WeddingCuratorCard";
import { PlanningJourney } from "@/features/vendors/components/PlanningJourney";
import { useVenueStore } from "@/store/useVenueStore";

// FAQ Item Accordion component
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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

import { useSavedStore } from "@/store/useSavedStore";

export default function VenueDetailsClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { isVenueSaved, toggleSaveVenue } = useSavedStore();
  
  // Find venue by slug
  const venue = featuredVenues.find((v) => v.slug === slug);

  // Safe check for store hydration
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isWishlisted = isMounted && venue ? isVenueSaved(venue.id) : false;

  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Complete Venue Gallery (No duplicates, complete image set)
  const allGalleryImages = React.useMemo(() => {
    if (!venue) return [];
    const list = Array.from(new Set([
      venue.imageUrl,
      ...(venue.gallery || []),
      "/images/editorial/venue_1.png",
      "/images/editorial/venue_2.png",
      "/images/editorial/venue_3.png",
      "/images/editorial/venue_4.png",
      "/images/editorial/hero_venue.png",
      "/images/editorial/garden_wedding.png",
      "/images/editorial/royal_wedding.png",
      "/images/editorial/mandap_design.png",
      "/images/editorial/minimal_wedding.png",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&auto=format&fit=crop&q=80",
    ].filter(Boolean))) as string[];
    return list;
  }, [venue]);

  // Gallery Navigation Handlers (No Loop: stops at first and last image)
  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveLightboxIndex((prev) => {
      if (prev === null || prev >= allGalleryImages.length - 1) return prev;
      return prev + 1;
    });
  }, [allGalleryImages.length]);

  const isFirstImage = activeLightboxIndex === 0;
  const isLastImage = activeLightboxIndex !== null && activeLightboxIndex === allGalleryImages.length - 1;

  // Keyboard navigation
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

  // Touch Swipe Handlers (Mobile)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
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
        // Swipe RIGHT -> LEFT = NEXT image
        handleNextImage();
      } else {
        // Swipe LEFT -> RIGHT = PREVIOUS image
        handlePrevImage();
      }
    }
  };

  // Mouse drag handlers (Desktop / Laptop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    mouseStartRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartRef.current === null) return;
    if (Math.abs(e.clientX - mouseStartRef.current) > 10) {
      isDraggingRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartRef.current === null) return;
    const deltaX = e.clientX - mouseStartRef.current;
    mouseStartRef.current = null;

    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        // Drag RIGHT -> LEFT = NEXT image
        handleNextImage();
      } else {
        // Drag LEFT -> RIGHT = PREVIOUS image
        handlePrevImage();
      }
    }
  };

  // Wheel scroll debounce for trackpad horizontal scrolling
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "portfolio", "amenities", "policies", "contact"];
      const scrollPos = window.scrollY + 140; // offset height

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + height) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!venue) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">Venue Not Found</h2>
        <p className="text-xs text-neutral-muted">The venue matching &quot;{slug}&quot; could not be loaded.</p>
        <Link href="/venues" className="px-6 py-2.5 rounded-full bg-[#8B263E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all">
          Explore Venues
        </Link>
      </div>
    );
  }

  // 5 showcase images for the top grid
  const showcaseGrid = allGalleryImages.slice(0, 5);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Venue profile link copied to clipboard!");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // Offset for sticky navbar
        behavior: "smooth",
      });
      setActiveTab(id);
    }
  };

  const subNavTabs = [
    { label: "Overview", id: "overview" },
    { label: "Gallery", id: "portfolio" },
    { label: "Amenities", id: "amenities" },
    { label: "Policies", id: "policies" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <main className="min-h-screen bg-neutral-cream pb-24 lg:pb-16 text-neutral-charcoal relative">
      
      {/* Complete Venue Gallery Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxIndex(null)}
            className="fixed top-[70px] sm:top-[76px] md:top-[88px] lg:top-[92px] bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 pb-6 md:pb-8 select-none overflow-hidden"
          >
            {/* Top Bar with clear header gap */}
            <div 
              className="flex items-center justify-between text-white z-10 mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-md">
                  {venue.name}
                </span>
                <span className="text-[10px] md:text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-white/90">
                  {activeLightboxIndex + 1} / {allGalleryImages.length}
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

            {/* Main Stage (Image + Drag/Swipe + Conditional Arrow controls) */}
            <div 
              className="relative flex-1 my-auto w-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden min-h-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Arrow Button (Hidden on First Image) */}
              {!isFirstImage && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/60 hover:bg-[#8B263E] text-white rounded-full backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}

              {/* Main Image */}
              <motion.div
                key={activeLightboxIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-5xl max-h-[55vh] md:max-h-[62vh] w-full h-full flex items-center justify-center pointer-events-none"
              >
                <img
                  src={allGalleryImages[activeLightboxIndex]}
                  alt={`${venue.name} photo ${activeLightboxIndex + 1}`}
                  className="max-w-full max-h-[55vh] md:max-h-[62vh] object-contain rounded-xl shadow-2xl"
                  draggable={false}
                />
              </motion.div>

              {/* Right Arrow Button (Hidden on Last Image) */}
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

            {/* Bottom Thumbnail Strip with clean bottom gap */}
            <div 
              className="w-full max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto py-2 px-4 hide-scrollbar z-10 justify-start sm:justify-center mt-2 mb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {allGalleryImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
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
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container & Gallery (Proper desktop header spacing) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 lg:pt-28">
        
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-muted hover:text-[#8B263E] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to directory</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#C5A880] text-gray-500 hover:text-neutral-charcoal transition-colors cursor-pointer"
              title="Share Page"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSaveVenue(venue.id)}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#8B263E] text-gray-500 hover:text-[#8B263E] transition-colors cursor-pointer"
              title={isWishlisted ? "Remove from Saved" : "Save Venue"}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Image Grid (5 Photos Showcase) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[22px] overflow-hidden bg-gray-150 h-[300px] md:h-[450px] relative shadow-md group/hero">
          <div 
            className="md:col-span-2 relative h-full w-full overflow-hidden cursor-pointer"
            onClick={() => setActiveLightboxIndex(0)}
          >
            <img
              src={showcaseGrid[0]}
              alt={`${venue.name} main showcase`}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 ease-out"
            />
          </div>

          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3.5 h-full">
            {showcaseGrid.slice(1, 5).map((imgUrl, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden bg-gray-200">
                <img
                  src={imgUrl}
                  alt={`Showcase item ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                  onClick={() => setActiveLightboxIndex(i + 1)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveLightboxIndex(0)}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-neutral-border text-neutral-charcoal text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md hover:bg-white hover:border-[#C5A880] transition-all cursor-pointer z-10"
          >
            🖼️ View All Photos
          </button>
        </div>
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
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            {/* Header / Info Block */}
            <div id="overview" className="scroll-mt-32">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#8B263E] px-3 py-1 rounded-full shadow-sm">
                  {venue.type} • {venue.space}
                </span>
                {venue.isVerified && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-[#8B263E] to-[#C5A880] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                    Verified Venue
                  </span>
                )}
                {venue.isPremium && (
                  <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#C5A880] px-3 py-1 rounded-full shadow-sm">
                    ⭐ Premium
                  </span>
                )}
                {venue.editorTag && (
                  <span className="bg-blue-50 border border-blue-200 text-[9px] font-black uppercase tracking-widest text-blue-700 px-3 py-1 rounded-full shadow-sm">
                    {venue.editorTag}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2D2D2D] leading-tight mb-3">
                {venue.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-muted">
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
                  <span className="text-neutral-charcoal pl-1">{venue.rating.toFixed(1)}</span>
                  <span>({venue.reviewCount} Reviews)</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{venue.location}, {venue.city}</span>
                </div>
              </div>
            </div>

            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[18px] bg-white border border-[#C5A880]/15 shadow-sm">
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Capacity</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{venue.maxCapacity} Pax</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Rooms</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{venue.rooms > 0 ? venue.rooms : "N/A"}</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Parking</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{venue.parking > 0 ? venue.parking : "Valet"}</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Space Type</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{venue.space}</span>
              </div>
            </div>

            {/* About / Venue Highlights */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Venue Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {venue.venueHighlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 bg-white hover:border-[#C5A880]/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C5A880] text-xs font-bold font-serif shadow-sm shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-neutral-charcoal block leading-tight">{highlight.replace('✔ ', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery (Masonry / Column Grid with All Gallery Images) */}
            <div id="portfolio" className="border-b border-gray-100 pb-6 scroll-mt-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal">Complete Venue Gallery</h3>
                <button
                  onClick={() => setActiveLightboxIndex(0)}
                  className="text-xs font-bold uppercase tracking-wider text-[#8B263E] hover:text-[#C5A880] transition-colors cursor-pointer"
                >
                  View Fullscreen ({allGalleryImages.length} photos) →
                </button>
              </div>
              <div className="columns-2 sm:columns-3 gap-3">
                {allGalleryImages.map((imgUrl, i) => (
                  <div key={i} className="mb-3 break-inside-avoid relative overflow-hidden rounded-xl bg-gray-100 group shadow-sm">
                    <img
                      src={imgUrl}
                      alt={`Gallery item ${i + 1}`}
                      className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => setActiveLightboxIndex(i)}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">Expand image</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Policies */}
            <div id="amenities" className="border-b border-gray-100 pb-6 scroll-mt-24 flex flex-col md:flex-row gap-8">
              
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Amenities</h3>
                <ul className="text-xs text-neutral-muted leading-relaxed flex flex-col gap-3">
                  {venue.amenities.map((amenity, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C5A880]" />
                      <span className="font-semibold">{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div id="policies" className="flex-1 scroll-mt-24">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Policies</h3>
                <ul className="text-xs text-neutral-muted leading-relaxed flex flex-col gap-3">
                  <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-semibold">Outside Catering</span>
                    <span className={venue.policies.outsideCatering ? "text-green-600 font-bold" : "text-rose-600 font-bold"}>
                      {venue.policies.outsideCatering ? "Allowed" : "Not Allowed"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-semibold">Outside Decorators</span>
                    <span className={venue.policies.outsideDecor ? "text-green-600 font-bold" : "text-rose-600 font-bold"}>
                      {venue.policies.outsideDecor ? "Allowed" : "Not Allowed"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-semibold">Alcohol Permitted</span>
                    <span className={venue.policies.alcohol ? "text-green-600 font-bold" : "text-rose-600 font-bold"}>
                      {venue.policies.alcohol ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-semibold">DJ Permitted</span>
                    <span className={venue.policies.dj ? "text-green-600 font-bold" : "text-rose-600 font-bold"}>
                      {venue.policies.dj ? "Yes" : "No"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="pb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">Frequently Asked Questions</h3>
              <div className="flex flex-col">
                <FaqItem
                  question="What is the booking process for this venue?"
                  answer="Once you request a quote, our concierge team will check availability, negotiate the best rates, and arrange a site visit. You can confirm the booking by paying the venue's advance deposit through our secure portal."
                />
                <FaqItem
                  question="Can I customize the menu if I use in-house catering?"
                  answer="Absolutely. The venue's culinary team provides multiple tasting sessions and allows full customization of the menu to suit your preferences and dietary requirements."
                />
                <FaqItem
                  question="Is there dedicated parking available?"
                  answer={`Yes, the venue provides dedicated parking for approximately ${venue.parking > 0 ? venue.parking : "a large number of"} vehicles along with complimentary valet services for all guests.`}
                />
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Card */}
          <div id="contact" className="lg:col-span-1 scroll-mt-24">
            <div className="lg:sticky lg:top-24 bg-white border border-[#C5A880]/20 rounded-[22px] p-6 shadow-[0_12px_40px_rgba(197,168,128,0.06)] flex flex-col">
              
              {/* Add to Cart Area (Replacing price) */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSaveVenue(venue.id)}
                  className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${
                    isWishlisted
                      ? "bg-[#8B263E] text-white border border-[#8B263E] shadow-[0_4px_16px_rgba(139,38,62,0.25)]"
                      : "bg-[#FAF9F6] text-neutral-charcoal border border-[#C5A880]/40 hover:border-[#8B263E] hover:text-[#8B263E]"
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "text-white fill-white" : "text-[#8B263E]"}`} />
                  <span>{isWishlisted ? "Added to Cart" : "Add to Cart"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={() => alert(`Requested quote for ${venue.name}.`)}
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all cursor-pointer shadow-md text-center"
                >
                  Get Custom Quote
                </button>
                <button
                  onClick={() => alert(`Requested site visit for ${venue.name}.`)}
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-[#8B263E] border border-[#8B263E] hover:bg-[#8B263E]/5 transition-all cursor-pointer text-center"
                >
                  Schedule Site Visit
                </button>
                
                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={() => toggleSaveVenue(venue.id)}
                    className="flex-1 py-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-neutral-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
                    {isWishlisted ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-neutral-charcoal text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
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
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-white fill-white" : "text-[#8B263E]"}`} />
            <span>{isWishlisted ? "Saved" : "Save"}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:+919876543210"
            className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold uppercase tracking-wider text-center transition-colors"
          >
            Call
          </a>
          <button
            onClick={() => alert(`Requested quote for ${venue.name}.`)}
            className="px-4 py-3 rounded-xl bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[11px] font-bold uppercase tracking-wider shadow-md text-center transition-colors"
          >
            Get Quote
          </button>
        </div>
      </div>

    </main>
  );
}
