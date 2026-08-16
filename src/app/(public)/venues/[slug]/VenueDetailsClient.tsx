"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, MapPin, CheckCircle, ChevronLeft, ChevronRight, Share2, 
  Star, ShieldCheck, ArrowLeft,
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

export default function VenueDetailsClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { weddingShortlist, toggleShortlist } = useVenueStore();
  
  // Find venue by slug
  const venue = featuredVenues.find((v) => v.slug === slug);

  // Safe check for store hydration
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isWishlisted = isMounted && venue ? weddingShortlist.includes(venue.id) : false;

  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Populate gallery (pad with default images if necessary to fill the 5-grid)
  const defaultImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
  ];
  
  const imagesGrid = [venue.imageUrl, ...venue.gallery.slice(1)];
  while(imagesGrid.length < 5) {
    imagesGrid.push(defaultImages[(imagesGrid.length - 1) % defaultImages.length]);
  }

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
      
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 text-white hover:text-[#C5A880] transition-colors p-2 z-[210] cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl"
            >
              <img
                src={activeLightbox}
                alt="Gallery item"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex items-center justify-between mb-6">
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
              onClick={() => toggleShortlist(venue.id)}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#8B263E] text-gray-500 hover:text-[#8B263E] transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Image Grid (5 Photos) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[22px] overflow-hidden bg-gray-150 h-[300px] md:h-[450px] relative shadow-md group/hero">
          <div className="md:col-span-2 relative h-full w-full overflow-hidden">
            <img
              src={imagesGrid[0]}
              alt={`${venue.name} main showcase`}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 ease-out"
            />
          </div>

          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3.5 h-full">
            {imagesGrid.slice(1, 5).map((imgUrl, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden bg-gray-200">
                <img
                  src={imgUrl}
                  alt={`Showcase item ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                  onClick={() => setActiveLightbox(imgUrl)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveLightbox(imagesGrid[0])}
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

            {/* Gallery (Pinterest Column Grid) */}
            <div id="portfolio" className="border-b border-gray-100 pb-6 scroll-mt-24">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Venue Gallery</h3>
              <div className="columns-2 sm:columns-3 gap-3">
                {imagesGrid.map((imgUrl, i) => (
                  <div key={i} className="mb-3 break-inside-avoid relative overflow-hidden rounded-xl bg-gray-100 group shadow-sm">
                    <img
                      src={imgUrl}
                      alt={`Gallery item ${i}`}
                      className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      onClick={() => setActiveLightbox(imgUrl)}
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
              
              <div className="mb-6">
                <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest">
                  Starting Price
                </span>
                <span className="text-2xl font-black text-[#8B263E]">
                  {venue.priceOnwards}
                </span>
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
                    onClick={() => toggleShortlist(venue.id)}
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250/60 p-3.5 flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div>
          <span className="text-[7.5px] uppercase font-black text-neutral-muted block tracking-widest">Pricing</span>
          <span className="text-sm font-black text-[#8B263E]">{venue.priceOnwards}</span>
        </div>
        <button
          onClick={() => alert(`Requested quote for ${venue.name}.`)}
          className="px-5 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[10px] font-black uppercase tracking-wider shadow-md cursor-pointer"
        >
          Get Free Quote
        </button>
      </div>

    </main>
  );
}
