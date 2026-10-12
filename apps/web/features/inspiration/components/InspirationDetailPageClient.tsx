import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Sparkles, Palette, Scissors, IndianRupee, Tag, CheckCircle2, UserCheck } from "lucide-react";
import { InspirationDetailItem } from "@/types/inspiration-types";
import { InspirationSubcategoryCard } from "./InspirationSubcategoryCard";
import { layout } from "@/styles";


interface InspirationDetailPageClientProps {
  item: InspirationDetailItem;
  relatedItems: InspirationDetailItem[];
}

export function InspirationDetailPageClient({ item, relatedItems }: InspirationDetailPageClientProps) {
  return (
    <div className="min-h-screen bg-[#FBF9F6] pb-0">
      {/* Sticky Breadcrumbs */}
      <div className="border-b border-[#E8D8BC]/30 bg-white/80 backdrop-blur-md sticky top-[72px] md:top-[88px] z-40">
        <div className={`${layout.maxWidth} px-4 sm:px-6 py-3 flex items-center text-xs font-medium text-neutral-500`}>
          <Link href="/" className="hover:text-[#C8A165] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-sm">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <Link href="/inspiration" className="hover:text-[#C8A165] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-sm">Inspiration</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <Link href={`/inspiration/${item.categorySlug}`} className="hover:text-[#C8A165] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165] rounded-sm">{item.categoryName}</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50" />
          <span className="text-neutral-900 font-bold line-clamp-1">{item.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-neutral-900 overflow-hidden">
        <Image
          src={item.heroImage}
          alt={item.title}
          fill
          unoptimized
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24">
          <div className={`${layout.maxWidth} px-4 sm:px-6 w-full`}>
            <span className="text-[10px] sm:text-xs font-black uppercase text-[#C8A165] tracking-[0.3em] mb-4 block">
              {item.categoryName} • {item.subCategory}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
              {item.designerOrVendor && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                  <UserCheck className="w-4 h-4 text-[#C8A165]" />
                  <span>{item.designerOrVendor}</span>
                </div>
              )}
              {item.budgetRange && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                  <IndianRupee className="w-4 h-4 text-[#C8A165]" />
                  <span>{item.budgetRange}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className={`${layout.maxWidth} px-4 sm:px-6 mt-16 md:mt-24`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Details & Gallery */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* Overview */}
            <section>
              <h2 className="font-serif text-3xl text-neutral-900 mb-6">Overview & Inspiration</h2>
              <p className="text-neutral-600 text-lg leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </section>

            {/* Key Highlights */}
            {item.keyHighlights && item.keyHighlights.length > 0 && (
              <section className="bg-white p-8 md:p-12 rounded-[20px] border border-[#E8D8BC]/30 shadow-sm">
                <h3 className="font-serif text-2xl text-neutral-900 mb-8 border-b border-[#E8D8BC]/30 pb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C8A165]" /> Key Highlights
                </h3>
                <ul className="flex flex-col gap-4">
                  {item.keyHighlights.map((hl, index) => (
                    <li key={index} className="flex items-start gap-3 text-neutral-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#8B263E] shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Color Palette Swatches */}
            {item.colorPalette && item.colorPalette.length > 0 && (
              <section className="bg-white p-8 md:p-12 rounded-[20px] border border-[#E8D8BC]/30 shadow-sm">
                <h3 className="font-serif text-2xl text-neutral-900 mb-8 border-b border-[#E8D8BC]/30 pb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#C8A165]" /> Color Palette Swatches
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {item.colorPalette.map((swatch, idx) => (
                    <div key={idx} className="flex flex-col items-center p-4 rounded-xl border border-neutral-100 bg-[#FAF7F2]">
                      <span className="w-12 h-12 rounded-full border border-black/10 shadow-sm mb-3" style={{ backgroundColor: swatch.hex }} />
                      <span className="text-xs font-bold text-neutral-900">{swatch.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono mt-1">{swatch.hex}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Stylist Tip */}
            {item.styleTip && (
              <section className="bg-[#FAF7F2] p-8 md:p-10 rounded-[20px] border border-[#E8D8BC]/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A165]/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs font-black uppercase text-[#8B263E] tracking-widest mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#C8A165]" /> Stylist Expert Tip
                </h3>
                <p className="text-neutral-800 italic text-base md:text-lg leading-relaxed">
                  &ldquo;{item.styleTip}&rdquo;
                </p>
              </section>
            )}

            {/* Image Gallery */}
            {item.gallery && item.gallery.length > 0 && (
              <section>
                <h2 className="font-serif text-3xl text-neutral-900 mb-8 flex items-center justify-between">
                  Inspiration Album
                  <span className="text-sm font-sans font-medium text-neutral-500 uppercase tracking-widest">
                    {item.gallery.length} Photos
                  </span>
                </h2>
                
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                  {item.gallery.map((img, index) => (
                    <div key={index} className="break-inside-avoid relative rounded-xl overflow-hidden group">
                      <Image
                        src={img}
                        alt={`${item.title} inspiration photo ${index + 1}`}
                        width={600}
                        height={800}
                        unoptimized
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-[140px] flex flex-col gap-8">
              
              {/* Quick Details Box */}
              <div className="bg-white rounded-[20px] border border-[#E8D8BC]/50 shadow-lg shadow-[#C8A165]/5 p-8">
                <h3 className="font-serif text-2xl text-neutral-900 mb-6 pb-4 border-b border-[#E8D8BC]/30">
                  Quick Details
                </h3>
                
                <ul className="flex flex-col gap-5">
                  {item.designerOrVendor && (
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-[#C8A165]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Creator / Brand</span>
                        <span className="text-sm font-bold text-neutral-900">{item.designerOrVendor}</span>
                      </div>
                    </li>
                  )}

                  {item.budgetRange && (
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                        <IndianRupee className="w-4 h-4 text-[#C8A165]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Estimated Investment</span>
                        <span className="text-sm font-bold text-neutral-900">{item.budgetRange}</span>
                      </div>
                    </li>
                  )}

                  {item.attributes && Object.entries(item.attributes).map(([key, val], idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-[#C8A165]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">{key}</span>
                        <span className="text-sm font-bold text-neutral-900">{val}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags Cloud */}
              {item.tags && item.tags.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#E8D8BC]/30 p-6">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-3">Tags & Styles</span>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-[#FAF7F2] text-[#8B6B35] rounded-full text-xs font-bold border border-[#E8D8BC]/40">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <Link 
                href={`/inspiration/${item.categorySlug}`}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A165]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {item.categoryName}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Recommendations Grid */}
      {relatedItems.length > 0 && (
        <div className="bg-white border-t border-[#E8D8BC]/30 mt-16 md:mt-24 pt-16 md:pt-20 pb-10 md:pb-16">
          <div className={`${layout.maxWidth} px-4 sm:px-6`}>
            <div className="flex flex-col mb-12 text-center items-center">
              <span className="font-sans text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-3">
                More Inspiration
              </span>
              <h2 className="font-serif text-4xl text-neutral-900">
                Other {item.categoryName} Designs
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedItems.map(rel => (
                <InspirationSubcategoryCard key={rel.id} item={rel} />
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
