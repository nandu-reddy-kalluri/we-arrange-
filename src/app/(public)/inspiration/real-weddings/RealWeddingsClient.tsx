"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, MapPin, Calendar, Camera, ArrowRight, RefreshCcw } from "lucide-react";
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
  { title: "Photography", link: "/inspiration?category=photography", img: "/images/editorial/vendor_photo.png" },
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
  const [visibleCount, setVisibleCount] = useState(8);

  const featuredWedding = weddings[0];
  const gridWeddings = weddings.slice(1);

  const filteredWeddings = useMemo(() => {
    return gridWeddings.filter((w) => {
      const matchCategory = activeCategory === "All" || w.theme.toLowerCase() === activeCategory.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      const matchSearch =
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${layout.maxWidth} px-4 sm:px-6 py-3 flex items-center text-xs font-medium text-neutral-500`}
        >
          <Link href="/" className="hover:text-[#C8A165] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-sm">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <Link href="/inspiration" className="hover:text-[#C8A165] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-sm">Inspiration</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <span className="text-neutral-900 font-bold">Real Weddings</span>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-center flex flex-col items-center justify-center min-h-[220px] px-4 pt-12 md:pt-16 pb-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className={`${layout.maxWidth} flex flex-col items-center`}
        >
          <motion.span variants={fadeUpVariant} className="font-sans text-[11px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-4">
            Real Wedding Stories
          </motion.span>
          <motion.h1 variants={fadeUpVariant} className="font-serif text-3xl md:text-4xl lg:text-[40px] font-bold text-neutral-900 mb-5 max-w-[800px] leading-tight line-clamp-2">
            Discover breathtaking weddings, timeless traditions, luxury celebrations, and unforgettable love stories.
          </motion.h1>
          <motion.div variants={fadeUpVariant}>
            <button 
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
              className="px-6 py-2.5 bg-[#8B263E] text-white rounded-full text-sm font-bold hover:bg-[#6e1c2f] transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#8B263E]"
            >
              Explore Stories
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-12`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCounter value={250} label="Real Weddings" />
          <StatCounter value={40} label="Cities" />
          <StatCounter value={500} label="Verified Vendors" />
          <StatCounter value={1000} label="Wedding Photos" />
        </div>
      </motion.section>

      {/* Search & Filters */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-10`}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white rounded-3xl border border-[#E8D8BC]/30 p-2 shadow-sm transition-all">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide px-2">
            {CATEGORIES.map(cat => (
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

          {/* Search */}
          <div className="relative w-full lg:w-[350px] shrink-0 px-2 lg:pr-2 lg:pl-0 pb-2 lg:pb-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search couple, venue, city..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
              className="w-full pl-11 pr-4 py-2.5 bg-[#FBF9F6] border border-transparent rounded-full text-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:border-[#C8A165]/50 focus:ring-2 focus:ring-[#C8A165]/30 focus:shadow-[0_0_15px_rgba(200,161,101,0.2)] placeholder:text-neutral-400"
              aria-label="Search weddings"
            />
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
