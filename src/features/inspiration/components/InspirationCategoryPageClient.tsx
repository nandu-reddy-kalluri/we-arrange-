"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, ArrowRight, RefreshCcw, Sparkles, X } from "lucide-react";
import { InspirationSubsectionConfig, InspirationDetailItem } from "@/types/inspiration-types";
import { InspirationSubcategoryCard } from "./InspirationSubcategoryCard";
import { InspirationSkeletonLoader } from "./InspirationSkeletonLoader";
import { layout, typography } from "@/styles";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";


interface InspirationCategoryPageClientProps {
  config: InspirationSubsectionConfig;
  items: InspirationDetailItem[];
}

const ALL_OTHER_SUBSECTIONS = [
  { title: "Bridal Wear", link: "/inspiration/bridal-wear", img: "/images/editorial/insp_bridal.png" },
  { title: "Groom Wear", link: "/inspiration/groom-wear", img: "/images/editorial/insp_groom.png" },
  { title: "Wedding Decor", link: "/inspiration/decor", img: "/images/editorial/vendor_decoration.png" },
  { title: "Wedding Themes", link: "/inspiration/wedding-themes", img: "/images/editorial/royal_wedding.png" },
  { title: "Color Palettes", link: "/inspiration/color-palettes", img: "/images/editorial/minimal_wedding.png" },
  { title: "Invitations", link: "/inspiration/invitations", img: "/images/editorial/insp_invitation.png" },
  { title: "Jewellery", link: "/inspiration/jewellery", img: "/images/editorial/insp_jewelry.png" },
  { title: "Makeup Trends", link: "/inspiration/makeup", img: "/images/editorial/vendor_makeup.png" },
  { title: "Hairstyles", link: "/inspiration/hairstyles", img: "/images/editorial/insp_bridal.png" },
  { title: "Mehendi Designs", link: "/inspiration/mehendi", img: "/images/editorial/vendor_makeup.png" },
  { title: "Photography", link: "/inspiration/photography", img: "/images/editorial/vendor_photography.png" },
];

function StatCounter({ value, label }: { value: number; label: string }) {
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

export function InspirationCategoryPageClient({ config, items }: InspirationCategoryPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const featuredItem = items.find(item => item.featured) || items[0];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        activeCategory === "All" ||
        item.subCategory.toLowerCase() === activeCategory.toLowerCase() ||
        item.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase());
      
      const lowerQuery = searchQuery.toLowerCase().trim();
      const matchSearch =
        !lowerQuery ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item.shortDescription.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.tags.some(t => t.toLowerCase().includes(lowerQuery));

      return matchCategory && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 4);
      setIsLoading(false);
    }, 250);
  };

  const handleReset = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setVisibleCount(8);
  };

  const otherSubsections = useMemo(() => {
    return ALL_OTHER_SUBSECTIONS.filter(s => !s.link.endsWith(config.slug)).slice(0, 6);
  }, [config.slug]);

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
          <span className="text-neutral-900 font-bold">{config.title}</span>
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
            {config.eyebrow}
          </motion.span>
          <motion.h1 variants={fadeUpVariant} className="font-serif text-3xl md:text-4xl lg:text-[40px] font-bold text-neutral-900 mb-5 max-w-[800px] leading-tight">
            {config.title}
          </motion.h1>
          <motion.p variants={fadeUpVariant} className="text-neutral-600 max-w-2xl text-sm md:text-base mb-6 leading-relaxed">
            {config.description}
          </motion.p>
          <motion.div variants={fadeUpVariant}>
            <button 
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
              className="px-6 py-2.5 bg-[#8B263E] text-white rounded-full text-sm font-bold hover:bg-[#6e1c2f] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B263E]"
            >
              Explore Collection
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics */}
      {config.stats && config.stats.length > 0 && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUpVariant}
          className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-12`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {config.stats.map((st, i) => (
              <StatCounter key={i} value={st.value} label={st.label} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Search & Filters */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-10`}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white rounded-3xl border border-[#E8D8BC]/30 p-2 shadow-sm transition-all">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide px-2" role="tablist" aria-label="Category filters">
            {config.categories.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
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

          {/* Search Input */}
          <div className="relative w-full lg:w-[350px] shrink-0 px-2 lg:pr-2 lg:pl-0 pb-2 lg:pb-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
              className="w-full pl-11 pr-10 py-2.5 bg-[#FBF9F6] border border-transparent rounded-full text-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:border-[#C8A165]/50 focus:ring-2 focus:ring-[#C8A165]/30 focus:shadow-[0_0_15px_rgba(200,161,101,0.2)] placeholder:text-neutral-400"
              aria-label={`Search ${config.title}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-full"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Featured Item Banner */}
      <AnimatePresence>
        {searchQuery === "" && activeCategory === "All" && featuredItem && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.97, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-14`}
          >
            <Link href={`/inspiration/${featuredItem.categorySlug}/${featuredItem.slug}`} className="group block relative rounded-[24px] overflow-hidden bg-black aspect-[16/9] md:aspect-[21/9] focus:outline-none focus:ring-4 focus:ring-[#C8A165]">
              <Image
                src={featuredItem.heroImage}
                alt={featuredItem.title}
                fill
                unoptimized
                priority
                className="object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C8A165]" />
                  Featured Spotlight
                </span>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C8A165] mb-2">{featuredItem.subCategory}</h3>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 group-hover:text-[#E8D8BC] transition-colors">{featuredItem.title}</h2>
                  <p className="text-white/80 line-clamp-2 md:text-lg">{featuredItem.shortDescription}</p>
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-full text-sm font-bold hover:bg-[#C8A165] hover:text-white transition-colors">
                    Explore Spotlight <ArrowRight className="w-4 h-4" />
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
          {visibleItems.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                  {visibleItems.map((item, index) => (
                    <InspirationSubcategoryCard key={item.id} item={item} index={index % 5} />
                  ))}
                </AnimatePresence>
              </div>
              
              {isLoading && (
                <div className="mt-6">
                  <InspirationSkeletonLoader count={4} />
                </div>
              )}

              {hasMore && !isLoading && (
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
                    Load More Inspirations
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
              <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-3">No matching items found</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto">Try clearing your search query or selecting a different category tab.</p>
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

      {/* Explore Other Subsections */}
      {otherSubsections.length > 0 && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUpVariant}
          className={`relative z-10 ${layout.maxWidth} px-4 sm:px-6 mb-16`}
        >
          <div className="flex flex-col mb-8 pb-4 border-b border-[#E8D8BC]/30">
            <span className="font-sans text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-2">
              Explore More Inspiration
            </span>
            <h2 className={`${typography.sectionTitle} text-neutral-900`}>
              Discover Other Subsections
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {otherSubsections.map((item, i) => (
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
      )}

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
          <h2 className="font-serif text-3xl font-bold mb-4 relative z-10">Get Curated {config.title} Ideas</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8 relative z-10">Subscribe for curated collections, expert styling tips, and top vendor contacts straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="flex-grow px-5 py-3 rounded-full text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C8A165]" required />
            <button type="submit" className="px-8 py-3 bg-[#C8A165] hover:bg-[#b08b53] text-white font-bold rounded-full transition-colors whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </motion.section>


    </div>
  );
}
