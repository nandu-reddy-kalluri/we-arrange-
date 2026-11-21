"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Calendar,
  Users,
  Video,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Vendor } from "@/mock-data/vendors";
import {
  fetchPaginatedVendors,
  fetchVendorDetail,
  getVendorFallbackImage,
  type VendorDetailResult,
} from "@/services/catalog/catalogApi";
import { CatalogEnquiryModal } from "@/components/shared/CatalogEnquiryModal";
import { EntityReviewsSection } from "@/components/shared/EntityReviewsSection";
import { WeddingCuratorCard } from "@/features/vendors/components/WeddingCuratorCard";
import { VendorTrustHighlights } from "@/features/vendors/components/VendorTrustHighlights";
import { PlanningJourney } from "@/features/vendors/components/PlanningJourney";
import { useSavedStore } from "@/store/useSavedStore";

function handleVendorImgError(category?: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = getVendorFallbackImage(category);
  };
}

function formatInrCurrency(amount: number, currency?: string | null): string {
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

function formatLakhsPrice(lakhs: number): string {
  if (!Number.isFinite(lakhs) || lakhs <= 0) return "Price on Request";
  return formatInrCurrency(lakhs * 100000);
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

function VendorDetailSkeleton() {
  return (
    <main className="min-h-screen bg-neutral-cream pb-16 text-neutral-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-6" />
        <div className="h-[300px] md:h-[450px] w-full bg-gray-200 rounded-[22px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-24 w-full bg-gray-200 rounded-2xl" />
            <div className="h-40 w-full bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-gray-200 rounded-[22px]" />
        </div>
      </div>
    </main>
  );
}

export default function VendorDetailsClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [detail, setDetail] = useState<VendorDetailResult | null>(null);
  const [similarVendors, setSimilarVendors] = useState<Vendor[]>([]);
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
    setSimilarVendors([]);

    void fetchVendorDetail(slug)
      .then((res) => {
        if (!active) return;
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          } else {
            setError(res.error || "Unable to load vendor details.");
          }
          setDetail(null);
          setIsLoading(false);
          return;
        }

        setDetail(res.data);
        setIsLoading(false);

        void fetchPaginatedVendors({
          category: res.data.categorySlug || undefined,
          limit: 5,
        }).then((relRes) => {
          if (!active || relRes.error) return;
          setSimilarVendors(
            relRes.items.filter((v) => v.slug !== res.data.vendor.slug).slice(0, 4)
          );
        });
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load vendor details.");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, reloadTick]);

  const vendor = detail?.vendor;
  const numericVendorId =
    vendor && /^\d+$/.test(vendor.id) ? Number(vendor.id) : undefined;

  const { isVendorSaved, toggleSaveVendor } = useSavedStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const isWishlisted = isMounted && vendor ? isVendorSaved(vendor.id) : false;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const galleryUrls = useMemo(() => {
    if (!detail) return [];
    return detail.galleryUrls.length > 0 ? detail.galleryUrls : [];
  }, [detail]);

  const validFaqs = useMemo(
    () =>
      (detail?.faqs ?? []).filter(
        (f): f is typeof f & { question: string; answer: string } =>
          Boolean(f.question && f.question.trim() && f.answer && f.answer.trim())
      ),
    [detail?.faqs]
  );

  const validSocialLinks = useMemo(
    () =>
      (detail?.socialLinks ?? []).filter(
        (s): s is typeof s & { url: string } => Boolean(s.url && s.url.trim())
      ),
    [detail?.socialLinks]
  );

  const subNavTabs = useMemo(() => {
    if (!detail) return [];
    const tabs: Array<{ label: string; id: string }> = [
      { label: "Overview", id: "overview" },
    ];
    if (detail.services.length > 0 || detail.pricing.length > 0) {
      tabs.push({ label: "Services", id: "services" });
    }
    if (galleryUrls.length > 0 || detail.videos.length > 0) {
      tabs.push({ label: "Portfolio", id: "portfolio" });
    }
    if (detail.packages.length > 0) {
      tabs.push({ label: "Packages", id: "packages" });
    }
    tabs.push({ label: "Reviews", id: "reviews" });
    if (validFaqs.length > 0) {
      tabs.push({ label: "FAQ", id: "faq" });
    }
    tabs.push({ label: "Contact", id: "contact" });
    return tabs;
  }, [detail, galleryUrls.length, validFaqs.length]);

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
    return <VendorDetailSkeleton />;
  }

  if (notFound || (!error && !detail)) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">
          Vendor Not Found
        </h2>
        <p className="text-xs text-neutral-muted max-w-md">
          The vendor profile &quot;{slug}&quot; could not be found or is no longer active.
        </p>
        <Link
          href="/vendors"
          className="px-6 py-2.5 rounded-full bg-[#8B263E] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all"
        >
          Back to Vendors Directory
        </Link>
      </div>
    );
  }

  if (error || !detail || !vendor) {
    return (
      <div className="min-h-screen bg-neutral-cream flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-8 h-8 text-[#8B263E]" />
        <h2 className="font-serif text-2xl font-bold text-neutral-charcoal">
          Unable to Load Vendor
        </h2>
        <p className="text-xs text-neutral-muted max-w-md">
          {error || "Something went wrong while fetching vendor details."}
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
            href="/vendors"
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-white text-neutral-charcoal font-bold text-xs uppercase tracking-wider hover:border-[#C5A880] transition-all"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const displayImages =
    galleryUrls.length > 0
      ? galleryUrls
      : [vendor.imageUrl || getVendorFallbackImage(vendor.category)];
  const heroSideImages = displayImages.slice(1, 5);
  const startingPriceLabel =
    detail.startingPriceInr && detail.startingPriceInr > 0
      ? formatInrCurrency(detail.startingPriceInr)
      : vendor.priceStart > 0
        ? formatLakhsPrice(vendor.priceStart)
        : "Price on Request";

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
      {/* Dynamic Lightbox for Portfolio Gallery (portaled above GlobalLayoutWrapper stacking context) */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {lightboxIndex !== null && displayImages[lightboxIndex] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxIndex(null)}
                className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4"
              >
                <button
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close gallery"
                  className="absolute top-6 right-6 text-white hover:text-[#C5A880] transition-colors p-2 z-[210] cursor-pointer"
                >
                  <X className="w-8 h-8" />
                </button>
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) =>
                          prev !== null
                            ? (prev - 1 + displayImages.length) % displayImages.length
                            : 0
                        );
                      }}
                      aria-label="Previous image"
                      className="absolute left-4 sm:left-8 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-[210] cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) =>
                          prev !== null ? (prev + 1) % displayImages.length : 0
                        );
                      }}
                      aria-label="Next image"
                      className="absolute right-4 sm:right-8 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-[210] cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl"
                >
                  <img
                    src={displayImages[lightboxIndex]}
                    alt={`${vendor.name} portfolio showcase ${lightboxIndex + 1}`}
                    onError={handleVendorImgError(vendor.category)}
                    className="max-w-full max-h-[85vh] object-contain rounded-xl"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Header Container & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
              <Link href="/vendors" className="hover:text-[#8B263E] transition-colors">
                Vendors
              </Link>
              <span>/</span>
              <Link
                href={`/vendors/${detail.categorySlug || vendor.category}`}
                className="hover:text-[#8B263E] transition-colors"
              >
                {detail.categoryName}
              </Link>
              <span>/</span>
              <span className="font-semibold text-neutral-charcoal truncate max-w-[220px]">
                {vendor.name}
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
              onClick={() => toggleSaveVendor(vendor.id)}
              className="p-2 rounded-full border border-gray-250 bg-white shadow-sm hover:border-[#8B263E] text-gray-500 hover:text-[#8B263E] transition-colors cursor-pointer"
              title={isWishlisted ? "Remove from Saved" : "Add to Saved"}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Hero Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[22px] overflow-hidden bg-gray-150 h-[300px] md:h-[450px] relative shadow-md group/hero">
          <div
            className={`${heroSideImages.length > 0 ? "md:col-span-2" : "md:col-span-4"} relative h-full w-full overflow-hidden`}
          >
            <img
              src={displayImages[0]}
              alt={`${vendor.name} main showcase`}
              onClick={() => setLightboxIndex(0)}
              onError={handleVendorImgError(vendor.category)}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 ease-out cursor-pointer"
            />
          </div>

          {heroSideImages.length > 0 && (
            <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3.5 h-full">
              {heroSideImages.map((imgUrl, i) => (
                <div
                  key={`${imgUrl}-${i}`}
                  className="relative h-full w-full overflow-hidden bg-gray-200"
                >
                  <img
                    src={imgUrl}
                    alt={`${vendor.name} showcase item ${i + 2}`}
                    onError={handleVendorImgError(vendor.category)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                    onClick={() => setLightboxIndex(i + 1)}
                  />
                </div>
              ))}
            </div>
          )}

          {displayImages.length > 0 && (
            <button
              onClick={() => setLightboxIndex(0)}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-neutral-border text-neutral-charcoal text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md hover:bg-white hover:border-[#C5A880] transition-all cursor-pointer z-10"
            >
              View Photos ({displayImages.length})
            </button>
          )}
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
          {/* Left Column: Vendor details */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Header / Info Block */}
            <div id="overview" className="scroll-mt-32">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#FAF9F6] border border-[#C5A880]/30 text-[9px] font-black uppercase tracking-widest text-[#8B263E] px-3 py-1 rounded-full shadow-sm">
                  {detail.categoryName}
                </span>
                {vendor.isVerified && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-[#8B263E] to-[#C5A880] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                    Verified Partner
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-3">
                {vendor.logoUrl && (
                  <img
                    src={vendor.logoUrl}
                    alt={`${vendor.name} logo`}
                    className="w-12 h-12 rounded-xl object-cover border border-[#C5A880]/30 bg-white shrink-0"
                  />
                )}
                <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2D2D2D] leading-tight">
                  {vendor.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-muted">
                {vendor.rating > 0 && (
                  <>
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
                      <span className="text-neutral-charcoal pl-1">
                        {vendor.rating.toFixed(1)}
                      </span>
                      {vendor.reviewsCount > 0 && (
                        <span>({vendor.reviewsCount} Reviews)</span>
                      )}
                    </div>
                    <span>•</span>
                  </>
                )}

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>
                    {vendor.location && vendor.location !== vendor.city
                      ? `${vendor.location}, ${vendor.city}`
                      : vendor.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Fact-based Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[18px] bg-white border border-[#C5A880]/15 shadow-sm">
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Category
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {detail.categoryName}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Starting Price
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {startingPriceLabel}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Services Listed
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {detail.services.length > 0 ? detail.services.length : "Custom"}
                </span>
              </div>
              <div className="text-center border-l border-gray-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-muted block mb-0.5">
                  Packages
                </span>
                <span className="text-sm font-extrabold text-[#8B263E]">
                  {detail.packages.length > 0 ? detail.packages.length : "On Enquiry"}
                </span>
              </div>
            </div>

            {/* About (Only rendered when DB description exists) */}
            {detail.rawDescription && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">
                  About the Vendor
                </h3>
                <p className="text-xs text-neutral-muted leading-relaxed whitespace-pre-line">
                  {detail.rawDescription}
                </p>
              </div>
            )}

            {/* Offered Services & Pricing */}
            {(detail.services.length > 0 || detail.pricing.length > 0) && (
              <div id="services" className="border-b border-gray-100 pb-6 scroll-mt-24 space-y-6">
                {detail.services.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                      Offered Services
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {detail.services.map((service, i) => (
                        <div
                          key={service.service_id}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-150 bg-white hover:border-[#C5A880]/40 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C5A880] text-xs font-bold font-serif shadow-sm shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-charcoal block">
                              {service.service_name}
                            </span>
                            {service.description && (
                              <span className="text-[10px] text-neutral-muted block mt-0.5">
                                {service.description}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.pricing.length > 0 && (
                  <div>
                    <h4 className="font-serif text-base font-bold text-neutral-charcoal mb-3">
                      Service Pricing
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detail.pricing.map((row) => (
                        <div
                          key={row.pricing_id}
                          className="p-3.5 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-bold text-neutral-charcoal block">
                              {row.service_name || "Service Rate"}
                            </span>
                            {row.price_unit && (
                              <span className="text-[10px] text-neutral-muted">
                                Per {row.price_unit}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black text-[#8B263E] shrink-0">
                            {row.price && row.price > 0
                              ? formatInrCurrency(row.price, row.currency)
                              : "On Request"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Showcase (Only when DB media exists) */}
            {(galleryUrls.length > 0 || detail.videos.length > 0) && (
              <div id="portfolio" className="border-b border-gray-100 pb-6 scroll-mt-24 space-y-6">
                {galleryUrls.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                      Portfolio Showcase
                    </h3>
                    <div className="columns-2 sm:columns-3 gap-3">
                      {galleryUrls.map((imgUrl, i) => (
                        <div
                          key={`${imgUrl}-${i}`}
                          className="mb-3 break-inside-avoid relative overflow-hidden rounded-xl bg-gray-100 group shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`${vendor.name} portfolio item ${i + 1}`}
                            loading="lazy"
                            onError={handleVendorImgError(vendor.category)}
                            className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                            onClick={() => setLightboxIndex(i)}
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
                      Featured Videos
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
                            {video.title || "Watch Showcase Video"}
                          </span>
                          <ExternalLink className="w-4 h-4 text-[#8B263E] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Packages (Only when DB packages exist) */}
            {detail.packages.length > 0 && (
              <div id="packages" className="border-b border-gray-100 pb-6 scroll-mt-24">
                <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-4">
                  Pricing Packages
                </h3>
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
                        <span className="text-base font-black text-[#8B263E] block mb-3">
                          {pkg.price && pkg.price > 0
                            ? formatInrCurrency(pkg.price, pkg.currency)
                            : "Price on Request"}
                        </span>
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
                            subject: `${pkg.package_name} Enquiry: ${vendor.name}`,
                            message: `Hi Concierge, we would like to enquire about the "${pkg.package_name}" package with ${vendor.name}.`,
                          })
                        }
                        className="w-full py-2.5 rounded-xl border border-[#C5A880] text-[#8B263E] hover:bg-[#8B263E] hover:text-white hover:border-[#8B263E] text-[10px] font-bold uppercase tracking-wider mt-5 transition-all cursor-pointer"
                      >
                        Enquire Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team, Availability & Social Links (Rendered only when DB records exist) */}
            {(detail.team.length > 0 ||
              detail.availability.length > 0 ||
              validSocialLinks.length > 0) && (
              <div className="border-b border-gray-100 pb-6 space-y-6">
                {detail.team.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#C5A880]" />
                      Team Members
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detail.team.map((member) => (
                        <div
                          key={member.team_id}
                          className="p-3.5 rounded-xl border border-gray-150 bg-white flex items-center gap-3"
                        >
                          {member.photo && (
                            <img
                              src={member.photo}
                              alt={member.name || "Team member"}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          )}
                          <div>
                            <span className="text-xs font-bold text-neutral-charcoal block">
                              {member.name || "Team Specialist"}
                            </span>
                            {member.role && (
                              <span className="text-[10px] text-neutral-muted block">
                                {member.role}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.availability.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C5A880]" />
                      Availability
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

                {validSocialLinks.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-charcoal mb-3">
                      Social Profiles
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {validSocialLinks.map((social) => (
                        <a
                          key={social.social_id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-[#C5A880] text-xs font-bold text-neutral-charcoal flex items-center gap-1.5 transition-colors"
                        >
                          <span>{social.platform || "Profile"}</span>
                          <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Reviews & Voting */}
            <div id="reviews" className="scroll-mt-24">
              <EntityReviewsSection vendorId={numericVendorId} entityName={vendor.name} />
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
              <div className="mb-6">
                <span className="text-[8px] font-black uppercase text-neutral-muted block tracking-widest">
                  Starting From
                </span>
                <span className="text-2xl font-black text-[#8B263E]">
                  {startingPriceLabel}
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-2">
                <button
                  onClick={() =>
                    setEnquiryModal({
                      open: true,
                      subject: `Wedding Journey Enquiry: ${vendor.name}`,
                      message: `Hi Concierge, we would like to discuss availability and packages with ${vendor.name}.`,
                    })
                  }
                  className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all cursor-pointer shadow-md text-center"
                >
                  Begin Your Wedding Journey
                </button>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => toggleSaveVendor(vendor.id)}
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
              <VendorTrustHighlights />
              <PlanningJourney />

              <div className="border-t border-gray-150 pt-6 mt-6 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-neutral-muted block tracking-widest mb-3">
                  Need Help?
                </span>
                <button
                  onClick={() =>
                    setEnquiryModal({
                      open: true,
                      subject: `Curator Consultation: ${vendor.name}`,
                      message: `Hi Curator, please connect with us regarding ${vendor.name}.`,
                    })
                  }
                  className="text-xs font-bold text-[#8B263E] hover:text-[#6e1c2f] transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Talk to Your Curator
                </button>
                <span className="text-[10px] font-bold text-[#C5A880] italic mt-1 font-serif">
                  Let&apos;s Plan Together
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Vendors Section (Only when live DB matches exist) */}
        {similarVendors.length > 0 && (
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
              <Link
                href={`/vendors/${detail.categorySlug || vendor.category}`}
                className="text-xs font-bold text-[#8B263E] hover:text-[#6e1c2f] uppercase tracking-wider"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarVendors.map((item) => (
                <Link
                  href={`/vendors/${item.slug}`}
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl || getVendorFallbackImage(item.category)}
                      alt={item.name}
                      loading="lazy"
                      onError={handleVendorImgError(item.category)}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-serif text-xs font-bold text-neutral-charcoal truncate mb-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-muted">
                      <span>
                        {item.rating > 0 ? `★ ${item.rating.toFixed(1)}` : item.city}
                      </span>
                      <span className="text-[#8B263E]">
                        {item.priceStart > 0
                          ? formatLakhsPrice(item.priceStart)
                          : "Price on Request"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Consultation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-250/60 p-3 flex items-center gap-3 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex-1">
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">
            Starts From
          </span>
          <span className="text-sm font-bold text-[#8B263E] leading-none">
            {startingPriceLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveVendor(vendor.id)}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider text-center transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`}
            />
            {isWishlisted ? "Saved" : "Save"}
          </button>
          <button
            onClick={() =>
              setEnquiryModal({
                open: true,
                subject: `Custom Quote Request: ${vendor.name}`,
                message: `Hi Concierge, please share a custom quote for ${vendor.name}.`,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[10px] font-bold uppercase tracking-wider shadow-md text-center transition-colors cursor-pointer"
          >
            Get Quote
          </button>
        </div>
      </div>

      <CatalogEnquiryModal
        isOpen={enquiryModal.open}
        onClose={() => setEnquiryModal({ open: false })}
        targetName={vendor.name}
        targetCity={vendor.city}
        vendorId={numericVendorId}
        defaultSubject={enquiryModal.subject}
        defaultMessage={enquiryModal.message}
      />
    </main>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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
