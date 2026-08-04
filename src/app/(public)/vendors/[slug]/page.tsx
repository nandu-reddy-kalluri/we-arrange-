"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, MapPin, CheckCircle, ChevronLeft, ChevronRight, Share2, 
  MessageCircle, Phone, Calendar, Star, ShieldCheck, ArrowLeft,
  ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockVendors, vendorCategories } from "@/mock-data/vendors";
import { WeddingCuratorCard } from "@/features/vendors/components/WeddingCuratorCard";
import { VendorTrustHighlights } from "@/features/vendors/components/VendorTrustHighlights";
import { PlanningJourney } from "@/features/vendors/components/PlanningJourney";

// Standard Indian Currency Formatter helper
const formatPrice = (lakhs: number) => {
  const rupees = lakhs * 100000;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(rupees);
};

// Mock portfolio images based on category or fallbacks
const getPortfolioImages = (category: string) => {
  const defaults = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519225495810-7517c2965a7d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&auto=format&fit=crop&q=80",
  ];
  return defaults;
};

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

// Chevron Down placeholder for FaqItem
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  // Find vendor by slug
  const slug = params?.slug as string;
  const vendor = mockVendors.find((v) => v.slug === slug);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);

  // Active section scroll tracking state
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "portfolio", "packages", "reviews", "faq", "contact"];
      const scrollPos = window.scrollY + 140; // offset height of details sticky tab bar

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

  if (!vendor) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">Vendor Not Found</h2>
        <p className="text-xs text-neutral-muted">The vendor slug matching &quot;{slug}&quot; could not be loaded.</p>
        <Link href="/vendors" className="px-6 py-2.5 rounded-full bg-[#8B263E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all">
          Back to Directory
        </Link>
      </div>
    );
  }

  const portfolio = getPortfolioImages(vendor.category);
  const imagesGrid = [vendor.imageUrl, ...portfolio.slice(0, 4)];


  const categoryName = vendorCategories.find(c => c.slug === vendor.category)?.name || vendor.category;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Vendor profile link copied to clipboard!");
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
    { label: "Portfolio", id: "portfolio" },
    { label: "Packages", id: "packages" },
    { label: "Reviews", id: "reviews" },
    { label: "FAQ", id: "faq" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <main className="min-h-screen bg-neutral-cream pb-24 lg:pb-16 text-neutral-charcoal relative">
      
      {/* Dynamic Lightbox for Portfolio Gallery */}
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
                alt="Portfolio showcase item"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Breadcrumb & Back */}
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
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#8B263E] text-gray-500 hover:text-[#8B263E] transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Airbnb-style Hero Image Grid (5 Photos) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[22px] overflow-hidden bg-gray-150 h-[300px] md:h-[450px] relative shadow-md group/hero">
          <div className="md:col-span-2 relative h-full w-full overflow-hidden">
            <img
              src={imagesGrid[0]}
              alt={`${vendor.name} main showcase`}
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

      {/* 2. Airbnb-inspired Sticky Sub-Navigation */}
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
          
          {/* Left Column: Vendor details */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            {/* Header / Info Block */}
            <div id="overview" className="scroll-mt-32">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#8B263E] px-3 py-1 rounded-full shadow-sm">
                  {categoryName}
                </span>
                {vendor.isVerified && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-[#8B263E] to-[#C5A880] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                    Verified Partner
                  </span>
                )}
                {vendor.isPremium && (
                  <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#C5A880] px-3 py-1 rounded-full shadow-sm">
                    ⭐ Bride&apos;s Choice 2026
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2D2D2D] leading-tight mb-3">
                {vendor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-muted">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(vendor.rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-neutral-charcoal pl-1">{vendor.rating.toFixed(1)}</span>
                  <span>({vendor.reviewsCount} Reviews)</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{vendor.location}, {vendor.city}</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700">98% Response Rate</span>
                </div>
              </div>
            </div>

            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[18px] bg-white border border-[#C5A880]/15 shadow-sm">
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Experience</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{vendor.experience || 5}+ Years</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Response Time</span>
                <span className="text-sm font-extrabold text-[#8B263E]">Fast (&lt; 2 Hrs)</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Space Type</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{vendor.spaceType || "Indoor / Outdoor"}</span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">Premium Segment</span>
                <span className="text-sm font-extrabold text-[#8B263E]">{vendor.tier || "Luxury"}</span>
              </div>
            </div>

            {/* About */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">About the Vendor</h3>
              <p className="text-xs text-neutral-muted leading-relaxed">
                {vendor.description || 
                  `With over ${vendor.experience || 5} years of professional background inside the wedding ecosystem, ${vendor.name} provides tailored setups focusing on elegance, premium assets, and custom creations. Based out of ${vendor.city}, our crew specializes in crafting exquisite experiences that exceed standard deliverables. Over the years, we have achieved top customer feedback marks (currently boasting a ${vendor.rating} star rating).`}
              </p>
            </div>

            {/* Offered Services */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Offered Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(vendor.tags || ["Bridal Shoot", "Pre Wedding Decor", "Cocktail Cater", "Bridal Makeup", "Sangeet Setup"]).map((tag, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 bg-white hover:border-[#C5A880]/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C5A880] text-xs font-bold font-serif shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-charcoal block">{tag}</span>
                      <span className="text-[10px] text-neutral-muted block mt-0.5">Custom designs & on-prem execution</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio (Pinterest Column Grid) */}
            <div id="portfolio" className="border-b border-gray-100 pb-6 scroll-mt-24">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Portfolio Showcase</h3>
              <div className="columns-2 sm:columns-3 gap-3">
                {portfolio.map((imgUrl, i) => (
                  <div key={i} className="mb-3 break-inside-avoid relative overflow-hidden rounded-xl bg-gray-100 group shadow-sm">
                    <img
                      src={imgUrl}
                      alt={`Portfolio item ${i}`}
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

            {/* Packages */}
            <div id="packages" className="border-b border-gray-100 pb-6 scroll-mt-24">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Pricing Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Silver */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A880] transition-colors shadow-sm">
                  <div>
                    <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest mb-1">Standard Option</span>
                    <h4 className="font-serif text-base font-bold text-[#2D2D2D] mb-1">Silver Package</h4>
                    <span className="text-base font-black text-[#8B263E] block mb-4">{formatPrice(vendor.priceStart)}</span>
                    <ul className="text-[10px] text-neutral-muted leading-relaxed flex flex-col gap-2 border-t border-gray-50 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Standard setup</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Single session</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> 1-day delivery</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => alert("Silver Consultation Package selection initiated.")}
                    className="w-full py-2.5 rounded-xl border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-white text-[9px] font-bold uppercase tracking-wider mt-5 transition-all cursor-pointer"
                  >
                    Select Silver
                  </button>
                </div>

                {/* Gold */}
                <div className="bg-[#FAF9F6] border-2 border-[#C5A880] rounded-2xl p-5 flex flex-col justify-between relative shadow-md">
                  <div className="absolute top-0 right-5 -translate-y-1/2 bg-[#8B263E] text-white text-[7.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#C5A880] block tracking-widest mb-1">Premium Option</span>
                    <h4 className="font-serif text-base font-bold text-[#2D2D2D] mb-1">Gold Premium</h4>
                    <span className="text-base font-black text-[#8B263E] block mb-4">{formatPrice(vendor.priceStart * 1.5)}</span>
                    <ul className="text-[10px] text-neutral-muted leading-relaxed flex flex-col gap-2 border-t border-gray-50 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> HD / Custom options</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Dual coverage sessions</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Full wedding edit catalog</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> 1 consultation hour</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => alert("Gold Consultation Package selection initiated.")}
                    className="w-full py-2.5 rounded-xl bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[9px] font-bold uppercase tracking-wider mt-5 transition-all shadow-sm cursor-pointer"
                  >
                    Select Gold
                  </button>
                </div>

                {/* Royal */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between hover:border-[#C5A880] transition-colors shadow-sm">
                  <div>
                    <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest mb-1">Exclusive Tier</span>
                    <h4 className="font-serif text-base font-bold text-[#2D2D2D] mb-1">Royal Signature</h4>
                    <span className="text-base font-black text-[#8B263E] block mb-4">{formatPrice(vendor.priceStart * 3)}</span>
                    <ul className="text-[10px] text-neutral-muted leading-relaxed flex flex-col gap-2 border-t border-gray-50 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Fully custom theme design</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> On-site director & crew</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Priority catalog fast-track</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#C5A880] shrink-0" /> Dedicated concierge liaison</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => alert("Royal Consultation Package selection initiated.")}
                    className="w-full py-2.5 rounded-xl border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-white text-[9px] font-bold uppercase tracking-wider mt-5 transition-all cursor-pointer"
                  >
                    Select Royal
                  </button>
                </div>

              </div>
            </div>

            {/* Reviews */}
            <div id="reviews" className="border-b border-gray-100 pb-6 scroll-mt-24">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">Customer Reviews</h3>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Ananya Sharma", date: "July 24, 2026", text: "Exceptional outcome! The wedding team was polite and accommodated all our small edits without extra billing. Fully recommend their Gold Package." },
                  { name: "Rohit Malhotra", date: "June 12, 2026", text: "Stunning experience! Very professional setup and they finished everything within our strict timelines. True luxury standard." },
                ].map((review, i) => (
                  <div key={i} className="p-4 bg-white border border-gray-150 rounded-[18px] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C5A880]/15 flex items-center justify-center text-[#8B263E] font-bold text-xs uppercase shadow-sm">
                          {review.name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-charcoal block">{review.name}</span>
                          <span className="text-[9px] text-green-700 font-extrabold uppercase tracking-widest flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5 text-green-600" /> Verified Booking
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-muted">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-yellow-500 my-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-muted leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div id="faq" className="pb-6 scroll-mt-24">
              <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">Frequently Asked Questions</h3>
              <div className="flex flex-col">
                <FaqItem
                  question="What is your cancellation and refund policy?"
                  answer="Cancellations requested 30 days prior to the wedding date qualify for a 50% deposit refund. Cancellations made under 30 days are non-refundable."
                />
                <FaqItem
                  question="Do you travel to outstation wedding locations?"
                  answer="Yes, travel and accommodation fees for destination wedding locations are covered by the client. Outstation wedding bookings require a separate custom package tier."
                />
                <FaqItem
                  question="How long does it take to deliver final catalogs/files?"
                  answer="Delivery usually takes between 3 to 6 weeks depending on package choices. Gold and Royal packages include priority editing queues for faster delivery."
                />
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Card & Availability */}
          <div id="contact" className="lg:col-span-1 scroll-mt-24">
            <div className="lg:sticky lg:top-24 bg-white border border-[#C5A880]/20 rounded-[22px] p-6 shadow-[0_12px_40px_rgba(197,168,128,0.06)] flex flex-col">
              
              {/* Cost starting details */}
              <div className="mb-6">
                <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest">
                  Starting From
                </span>
                <span className="text-2xl font-black text-[#8B263E]">
                  {formatPrice(vendor.priceStart)}
                </span>
              </div>

              {/* Primary Booking CTA Action */}
              <div className="flex flex-col gap-3 mb-2">
                <button
                  onClick={() => alert(`Initiated wedding journey for ${vendor.name}.`)}
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all cursor-pointer shadow-md text-center"
                >
                  Begin Your Wedding Journey
                </button>
                
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
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
              <VendorTrustHighlights />
              <PlanningJourney />

              <div className="border-t border-gray-150 pt-6 mt-6 flex flex-col items-center">
                 <span className="text-[9px] font-black uppercase text-neutral-muted block tracking-widest mb-3">
                   Need Help?
                 </span>
                 <button
                    onClick={() => alert(`Connecting with curator for ${vendor.name}.`)}
                    className="text-xs font-bold text-[#8B263E] hover:text-[#6e1c2f] transition-colors uppercase tracking-wider cursor-pointer"
                 >
                   Talk to Your Curator
                 </button>
                 <span className="text-[10px] font-bold text-[#C5A880] italic mt-1 font-serif">
                   Let's Plan Together
                 </span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Similar Vendors Section (Couples also viewed) */}
        <div className="mt-16 pt-10 border-t border-gray-250/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-sans text-[9px] font-black uppercase text-[#C5A880] tracking-widest block mb-1">
                More Choices
              </span>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-neutral-charcoal">
                Couples also viewed
              </h3>
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={() => alert("Prev similar vendors")}
                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-neutral-charcoal hover:border-[#C5A880] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert("Next similar vendors")}
                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-neutral-charcoal hover:border-[#C5A880] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockVendors
              .filter((v) => v.category === vendor.category && v.slug !== vendor.slug)
              .slice(0, 4)
              .map((item) => (
                <Link
                  href={`/vendors/${item.slug}`}
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-serif text-xs font-bold text-neutral-charcoal truncate mb-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-muted">
                      <span>★ {item.rating.toFixed(1)}</span>
                      <span className="text-[#8B263E]">{formatPrice(item.priceStart)}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

      </div>

      {/* 4. Mobile Sticky Bottom Consultation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250/60 p-3.5 flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div>
          <span className="text-[7.5px] uppercase font-black text-neutral-muted block tracking-widest">Starts From</span>
          <span className="text-sm font-black text-[#8B263E]">{formatPrice(vendor.priceStart)}</span>
        </div>
        <button
          onClick={() => alert(`Initiated wedding journey for ${vendor.name}.`)}
          className="px-5 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[10px] font-black uppercase tracking-wider shadow-md cursor-pointer"
        >
          Begin Your Journey
        </button>
      </div>

    </main>
  );
}

// Simple absolute SVG loaders inline
function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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
