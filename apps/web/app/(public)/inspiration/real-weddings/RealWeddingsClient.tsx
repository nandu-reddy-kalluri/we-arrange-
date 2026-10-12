"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, MapPin, Calendar, Camera, ArrowRight, RefreshCcw, Sparkles, X } from "lucide-react";
import { RealWeddingDetail } from "@/mock-data/real-weddings";
import { RealWeddingCard } from "./RealWeddingCard";
import { layout, typography, spacing } from "@/styles";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";


interface RealWeddingsClientProps {
  weddings: RealWeddingDetail[];
}

const CATEGORIES = [
  "All", "Royal", "Traditional", "Luxury", "Destination", "Beach", "Garden", "Minimal", "Palace"
];

const EXPLORE_MORE = [
  { title: "Wedding Themes", link: "/inspiration?category=themes", img: "/images/editorial/royal_wedding.png" },
  { title: "Decor Inspiration", link: "/inspiration?category=decor", img: "/images/editorial/vendor_decoration.png" },
  { title: "Photography", link: "/inspiration?category=photography", img: "/images/editorial/vendor_photography.png" },
  { title: "Bridal Fashion", link: "/inspiration?category=bridal-fashion", img: "/images/editorial/insp_jewelry.png" },
  { title: "Groom Fashion", link: "/inspiration?category=groom-fashion", img: "/images/editorial/venue_3.png" },
  { title: "Wedding Trends", link: "/inspiration?category=wedding-trends", img: "/images/editorial/venue_1.png" },
];

function StatCounter({ value, label }: { value: number, label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1,
        ease: "easeOut",
        onUpdate(v) {
          setCount(Math.floor(v));
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[#E8D8BC]/30 p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform duration-300">
      <div className="font-serif text-3xl font-bold text-[#C8A165] mb-1">{count}+</div>
      <div className="text-xs font-bold uppercase tracking-widest text-neutral-600">{label}</div>
    </div>
  );
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function RealWeddingsClient({ weddings }: RealWeddingsClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const featuredWedding = weddings[0];
  const gridWeddings = weddings.slice(1);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // All recommendation suggestions from weddings (couples, venues, cities, themes)
  const allSuggestions = useMemo(() => {
    const map = new Map<string, { title: string; type: string }>();

    CATEGORIES.filter(c => c !== "All").forEach(cat => {
      map.set(cat.toLowerCase(), { title: cat, type: "Theme" });
    });

    weddings.forEach(w => {
      if (w.coupleNames) map.set(w.coupleNames.toLowerCase(), { title: w.coupleNames, type: "Couple" });
      if (w.venue) map.set(w.venue.toLowerCase(), { title: w.venue, type: "Venue" });
      if (w.city) map.set(w.city.toLowerCase(), { title: w.city, type: "City" });
    });

    return Array.from(map.values());
  }, [weddings]);

  // Smart letter-based matching for recommendations
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allSuggestions;
    return allSuggestions.filter(s => s.title.toLowerCase().includes(q));
  }, [allSuggestions, searchQuery]);

  const filteredWeddings = useMemo(() => {
    return gridWeddings.filter((w) => {
      const matchCategory = activeCategory === "All" || w.theme.toLowerCase() === activeCategory.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase().trim();
      const matchSearch =
        !lowerQuery ||
        w.coupleNames.toLowerCase().includes(lowerQuery) ||
        w.venue.toLowerCase().includes(lowerQuery) ||
        w.city.toLowerCase().includes(lowerQuery) ||
        w.theme.toLowerCase().includes(lowerQuery);
      return matchCategory && matchSearch;
    });
  }, [gridWeddings, activeCategory, searchQuery]);

  const visibleWeddings = filteredWeddings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWeddings.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const handleReset = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setVisibleCount(8);
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F6] pb-0 relative overflow-hidden flex flex-col">
      {/* Decorative background lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A165]/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] left-0 w-[600px] h-[600px] bg-[#8B263E]/3 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Breadcrumb */}
      <div className="border-b border-[#E8D8BC]/30 bg-white/90 backdrop-blur-md sticky top-[72px] md:top-[88px] z-40">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${layout.maxWidth} px-4 sm:px-6 py-3`}
        >
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Link href="/" className="hover:text-[#8B263E] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link href="/inspiration" className="hover:text-[#8B263E] transition-colors">Inspiration</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[#8B263E] font-bold">Real Weddings</span>
          </div>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-10 px-4 sm:px-6 text-center max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5ED] border border-[#E8D8BC] mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8A165] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B263E]">Exclusive Gallery</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-900 tracking-tight mb-4 font-light"
        >
          Real Celebrations, <span className="italic font-normal text-[#8B263E]">Timeless</span> Memories
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Immerse yourself in authentic love stories, magnificent venues, exquisite ensembles, and lavish decor crafted by India’s finest wedding curators.
        </motion.p>
      </section>

      {/* Statistics Counter */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-12`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCounter value={120} label="Weddings Featured" />
          <StatCounter value={45} label="Luxury Destinations" />
          <StatCounter value={350} label="Top Vendors" />
          <StatCounter value={15} label="Wedding Themes" />
        </div>
      </motion.section>

      {/* Filter & Search Bar */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative ${isSearchOpen ? "z-40" : "z-10"} ${layout.maxWidth} px-4 sm:px-6 mb-10`}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white rounded-3xl border border-[#E8D8BC]/30 p-2 shadow-sm transition-all overflow-visible">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide px-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A165] ${
                  activeCategory === cat
                    ? "bg-[#8B263E] text-white shadow-md"
                    : "bg-transparent text-neutral-600 hover:bg-[#FAF7F2] hover:text-neutral-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search with Recommendation Popover */}
          <div ref={searchContainerRef} className="relative w-full lg:w-[350px] shrink-0 px-2 lg:pr-2 lg:pl-0 pb-2 lg:pb-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search couple, venue, city..."
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onClick={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(8);
                setIsSearchOpen(true);
              }}
              className="w-full pl-11 pr-10 py-2.5 bg-[#FBF9F6] border border-transparent rounded-full text-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:border-[#C8A165]/50 focus:ring-2 focus:ring-[#C8A165]/30 focus:shadow-[0_0_15px_rgba(200,161,101,0.2)] placeholder:text-neutral-400"
              aria-label="Search weddings"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setVisibleCount(8);
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-full"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Recommendations Dropdown */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-2 right-2 lg:left-0 lg:right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-[#C5A880]/30 p-3 z-[1000] text-left"
                >
                  <div className="px-2 py-1 border-b border-neutral-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A165] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C8A165]" />
                      {searchQuery.trim() ? "Matching Weddings" : "Recommended Searches"}
                    </span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-[10px] text-neutral-400 hover:text-[#8B263E] font-semibold transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                    {filteredSuggestions.map((item, idx) => (
                      <button
                        key={`${item.title}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.title);
                          setVisibleCount(8);
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium text-neutral-800 hover:bg-[#FAF5ED] hover:text-[#8B263E] transition-all text-left group"
                      >
                        <span className="truncate font-semibold group-hover:text-[#8B263E]">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 shrink-0 ml-2 group-hover:text-[#C8A165]">
                          {item.type}
                        </span>
                      </button>
                    ))}

                    {filteredSuggestions.length === 0 && (
                      <div className="text-center py-5 px-2">
                        <p className="text-xs text-neutral-500 font-medium">No results found for &quot;{searchQuery}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-1 text-xs text-[#8B263E] font-bold hover:underline"
                        >
                          Show all
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Featured Wedding (Static) */}
      <AnimatePresence>
        {searchQuery === "" && activeCategory === "All" && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.97, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-14`}
          >
            <Link href={`/inspiration/real-weddings/${featuredWedding.slug}`} className="group block relative rounded-[24px] overflow-hidden bg-black aspect-[16/9] md:aspect-[21/9] focus:outline-none focus:ring-4 focus:ring-[#C8A165]">
              <Image
                src={featuredWedding.heroImage}
                alt={featuredWedding.title}
                fill
                unoptimized
                priority
                className="object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A165]" />
                  Featured Wedding
                </span>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C8A165] mb-2">{featuredWedding.coupleNames}</h3>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 group-hover:text-[#E8D8BC] transition-colors">{featuredWedding.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80 mb-4">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {featuredWedding.venue}, {featuredWedding.city}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {featuredWedding.date}</span>
                    <span className="px-2 py-0.5 border border-white/30 rounded-full text-[10px] uppercase tracking-wider">{featuredWedding.theme}</span>
                  </div>
                  <p className="text-white/80 line-clamp-2 md:text-lg">{featuredWedding.shortDescription}</p>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-full text-sm font-bold hover:bg-[#C8A165] hover:text-white transition-colors">
                    Read Story <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Grid */}
      <section className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-16 flex-grow`}>
        <AnimatePresence mode="wait">
          {visibleWeddings.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                  {visibleWeddings.map((w, index) => (
                    <RealWeddingCard key={w.slug} wedding={w} index={index % 4} />
                  ))}
                </AnimatePresence>
              </div>
              
              {hasMore && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-12 text-center"
                >
                  <button 
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-[#E8D8BC] text-neutral-900 rounded-full text-sm font-bold shadow-sm hover:bg-[#FAF7F2] hover:border-[#C8A165] hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Load More Weddings
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="py-20 text-center bg-white rounded-3xl border border-[#E8D8BC]/30 shadow-sm"
            >
              <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-[#C8A165]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-3">No weddings match your search</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto">Try adjusting your filters, selecting a different city, or searching for a different venue style.</p>
              <button 
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B263E] text-white rounded-full text-sm font-bold hover:bg-[#6e1c2f] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B263E]"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Explore More Inspiration */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-16`}
      >
        <div className="flex flex-col mb-8 pb-4 border-b border-[#E8D8BC]/30">
          <span className="font-sans text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-2">
            Continue Discovering
          </span>
          <h2 className={`${typography.sectionTitle} text-neutral-900`}>
            Explore More Inspiration
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {EXPLORE_MORE.map((item, i) => (
            <Link key={i} href={item.link} className="group block relative rounded-2xl overflow-hidden aspect-square border border-[#E8D8BC]/30 focus:outline-none focus:ring-2 focus:ring-[#C8A165]">
              <Image src={item.img} alt={item.title} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <span className="text-white font-bold text-sm drop-shadow-md">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Newsletter CTA */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-8 md:mb-12`}
      >
        <div className="bg-[#8B263E] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <h2 className="font-serif text-3xl font-bold mb-4 relative z-10">Never miss new wedding inspirations</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8 relative z-10">Subscribe for curated stories, latest trends, and expert planning tips delivered straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="flex-grow px-5 py-3 rounded-full text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C8A165]" required />
            <button type="submit" className="px-8 py-3 bg-[#C8A165] hover:bg-[#b08b53] text-white font-bold rounded-full transition-colors whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </motion.section>


    </div>
  );
}
